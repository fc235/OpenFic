import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

async function runFormalGate(t, fileNames, version = "1.0.0") {
  const config = await readFile(new URL("../../electron-builder.yml", import.meta.url), "utf8");
  const hook = config.match(/^beforePack:\s*(\S+)/m)?.[1];
  assert.ok(hook, "The formal electron-builder config must register a beforePack gate");
  const { default: beforePack } = await import(new URL(`../../${hook}`, import.meta.url));
  const root = await mkdtemp(path.join(os.tmpdir(), "openfic-package-gate-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  if (fileNames !== null) {
    await mkdir(path.join(root, "backend", "dist"), { recursive: true });
    for (const fileName of fileNames) {
      await writeFile(path.join(root, "backend", "dist", fileName), "fixture");
    }
  }
  return beforePack({ packager: { projectDir: path.join(root, "desktop"), appInfo: { version } } });
}

test("formal packaging accepts exactly one matching wheel alongside an sdist", async (t) => {
  await runFormalGate(t, ["openfic-1.0.0-py3-none-any.whl", "openfic-1.0.0.tar.gz"]);
});

for (const [label, names, error] of [
  ["missing directory", null, /OpenFic wheel.*backend.*dist/i],
  ["missing wheel", [], /exactly one OpenFic wheel.*found 0/i],
  ["wrong version", ["openfic-0.11.0-py3-none-any.whl"], /OpenFic wheel.*1\.0\.0.*0\.11\.0/i],
  ["duplicates", ["openfic-1.0.0-py3-none-any.whl", "openfic-1.0.0-py3-none-win_amd64.whl"], /exactly one OpenFic wheel.*found 2/i],
  ["stale wheel alongside current wheel", ["openfic-1.0.0-py3-none-any.whl", "openfic-0.11.0-py3-none-any.whl"], /exactly one OpenFic wheel.*found 2/i],
]) {
  test(`formal packaging rejects ${label}`, async (t) => {
    await assert.rejects(runFormalGate(t, names), error);
  });
}

test("formal packaging validates the effective desktop version override", async (t) => {
  await assert.rejects(
    runFormalGate(t, ["openfic-1.0.0-py3-none-any.whl"], "1.0.1"),
    /OpenFic wheel.*1\.0\.1.*1\.0\.0/i,
  );
});
