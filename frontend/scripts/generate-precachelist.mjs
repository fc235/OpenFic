import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = fileURLToPath(new URL("../dist", import.meta.url));

const EXCLUDE_FILES = new Set(["font-faces.css", "sw.js", "sw-precache.js"]);
const EXCLUDE_EXTS = new Set([".woff2", ".woff", ".ttf", ".otf", ".eot", ".map"]);
const NON_WOFF2_EXTS = new Set([".woff", ".ttf", ".otf", ".eot"]);
const FONT_FACE_PATTERN = /@font-face\s*\{[^}]*\}/g;

function walk(dir, acc) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function splitCssSources(sources) {
  const entries = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < sources.length; index += 1) {
    const character = sources[index];
    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
    } else if (character === "," && depth === 0) {
      entries.push(sources.slice(start, index).trim());
      start = index + 1;
    }
  }

  entries.push(sources.slice(start).trim());
  return entries;
}

function keepWoff2Sources(css) {
  return css.replace(FONT_FACE_PATTERN, (fontFace) => {
    let hasWoff2Source = false;
    const rewrittenFontFace = fontFace.replace(
      /src:\s*([^;}]+)([;}])/gi,
      (_sourceDeclaration, sources, terminator) => {
        const woff2Sources = splitCssSources(sources).filter((source) =>
          /\.woff2(?:[?#)]|["'])/i.test(source),
        );
        if (!woff2Sources.length) return "";

        hasWoff2Source = true;
        return `src:${woff2Sources.join(", ")}${terminator}`;
      },
    );

    return hasWoff2Source ? rewrittenFontFace : "";
  });
}

function rewriteSharedFontUrls(fontFace) {
  return fontFace.replace(
    /url\((?:["']?)(?:[^'")]*\/)?([^/'")]+\.woff2)(?:["']?)\)/gi,
    'url("/frontend-fonts/$1")',
  );
}

function prepareFontAssets() {
  const sharedFontFaces = [];
  const files = walk(distDir, []);

  for (const file of files) {
    if (file.endsWith(`${sep}font-faces.css`)) continue;
    const dot = file.lastIndexOf(".");
    const ext = dot >= 0 ? file.slice(dot).toLowerCase() : "";

    if (NON_WOFF2_EXTS.has(ext)) {
      unlinkSync(file);
      continue;
    }

    if (ext !== ".css") continue;

    const css = keepWoff2Sources(readFileSync(file, "utf8"));
    writeFileSync(file, css);
    sharedFontFaces.push(...(css.match(FONT_FACE_PATTERN) ?? []).map(rewriteSharedFontUrls));
  }

  writeFileSync(join(distDir, "font-faces.css"), `${sharedFontFaces.join("\n")}\n`);
}

prepareFontAssets();
const files = walk(distDir, []);
const indexHtml = readFileSync(join(distDir, "index.html"), "utf8");
const shellPaths = new Set(
  [...indexHtml.matchAll(/(?:src|href)=["'](\/[^"']+)["']/g)].map((match) => match[1]),
);
shellPaths.add("/index.html");

const manifestPath = join(distDir, "manifest.webmanifest");
try {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const icon of manifest.icons ?? []) {
    if (typeof icon.src === "string" && icon.src.startsWith("/")) shellPaths.add(icon.src);
  }
} catch {
  // The manifest is optional; index.html and its static dependency closure are sufficient.
}

const precacheList = [...shellPaths]
  .filter((path) => {
    const name = path.split("/").pop();
    if (EXCLUDE_FILES.has(name)) return false;
    const dot = name.lastIndexOf(".");
    const ext = dot >= 0 ? name.slice(dot).toLowerCase() : "";
    return !EXCLUDE_EXTS.has(ext);
  })
  .sort((left, right) => left.localeCompare(right));

const buildHash = createHash("sha256");
for (const file of files) {
  if (file.endsWith(`${sep}sw-precache.js`)) continue;
  buildHash.update(relative(distDir, file).split(sep).join("/"));
  buildHash.update(readFileSync(file));
}
const buildId = buildHash.digest("hex").slice(0, 16);
const output = `self.__OPENFIC_BUILD_ID = ${JSON.stringify(buildId)};\nself.__PRECACHE_LIST = ${JSON.stringify(precacheList, null, 2)};\n`;

writeFileSync(join(distDir, "sw-precache.js"), output);
console.log(`precache list generated: ${precacheList.length} entries`);
