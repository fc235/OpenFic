import { createHash } from "node:crypto";
import { access, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve(process.argv[2] ?? "dist-electron");
const packageJson = JSON.parse(await readFile(path.resolve("package.json"), "utf8"));
const version = process.env.OPENFIC_UPDATE_VERSION ?? packageJson.version;
const supportedArchitectures = ["x86_64", "aarch64"];
const legacyArchitectures = { x86_64: "x64", aarch64: "arm64" };

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileInfo(fileName) {
  const filePath = path.join(outputDirectory, fileName);
  const contents = await readFile(filePath);
  const fileStats = await stat(filePath);
  return {
    fileName,
    sha512: createHash("sha512").update(contents).digest("base64"),
    size: fileStats.size,
  };
}

const universalInstaller = `OpenFic-${version}-win-setup.exe`;
for (const fileName of [universalInstaller, `${universalInstaller}.blockmap`]) {
  const filePath = path.join(outputDirectory, fileName);
  if (await exists(filePath)) await rm(filePath);
}

const architectures = [];
for (const architecture of supportedArchitectures) {
  if (await exists(path.join(outputDirectory, `OpenFic-${version}-win-${architecture}-setup.exe`))) architectures.push(architecture);
}
if (architectures.length === 0) throw new Error(`No Windows installers found for ${version}`);

const files = await Promise.all(
  architectures.map(async (architecture) => ({
    architecture,
    ...(await getFileInfo(`OpenFic-${version}-win-${architecture}-setup.exe`)),
  })),
);
const releaseDate = new Date().toISOString();

function createUpdateInfo(file, compatibilityArchitecture) {
  const url = compatibilityArchitecture ? `${file.fileName}?arch=${compatibilityArchitecture}` : file.fileName;
  return [
    `version: ${version}`,
    "files:",
    `  - url: ${url}`,
    `    sha512: ${file.sha512}`,
    `    size: ${file.size}`,
    `path: ${url}`,
    `sha512: ${file.sha512}`,
    `releaseDate: '${releaseDate}'`,
    "",
  ].join("\n");
}

const legacyLatestYml = [
  `version: ${version}`,
  "files:",
  ...files.flatMap((file) => [
    `  - url: ${file.fileName}?arch=${legacyArchitectures[file.architecture]}`,
    `    sha512: ${file.sha512}`,
    `    size: ${file.size}`,
  ]),
  `path: ${files[0].fileName}?arch=${legacyArchitectures[files[0].architecture]}`,
  `sha512: ${files[0].sha512}`,
  `releaseDate: '${releaseDate}'`,
  "",
].join("\n");

await Promise.all([
  // Older clients select Windows assets by Electron architecture substring; query aliases retain that compatibility.
  writeFile(path.join(outputDirectory, "latest.yml"), legacyLatestYml, "utf8"),
  ...files.map((file) => writeFile(path.join(outputDirectory, `latest-win-${file.architecture}.yml`), createUpdateInfo(file), "utf8")),
]);
