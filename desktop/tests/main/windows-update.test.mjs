import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const run = promisify(execFile);
const script = path.resolve(import.meta.dirname, "../../scripts/prepare-windows-update.mjs");
for (const architectures of [["x86_64"], ["aarch64"], ["x86_64", "aarch64"]]) {
  test(`Windows update metadata covers available installers: ${architectures.join(", ")}`, async (t) => {
    const root = await mkdtemp(path.join(os.tmpdir(), "openfic-update-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    await writeFile(path.join(root, "package.json"), JSON.stringify({ version: "1.3.0" }));
    for (const arch of architectures) await writeFile(path.join(root, `OpenFic-1.3.0-win-${arch}-setup.exe`), `installer ${arch}`);
    await run(process.execPath, [script, root], { cwd: root, env: { ...process.env, OPENFIC_UPDATE_VERSION: "1.3.0" } });
    const legacy = await readFile(path.join(root, "latest.yml"), "utf8");
    for (const arch of architectures) {
      const alias = arch === "x86_64" ? "x64" : "arm64";
      assert.ok(legacy.includes(`OpenFic-1.3.0-win-${arch}-setup.exe?arch=${alias}`));
      const manifest = await readFile(path.join(root, `latest-win-${arch}.yml`), "utf8");
      assert.ok(manifest.includes(`OpenFic-1.3.0-win-${arch}-setup.exe`));
      assert.ok(!manifest.includes("?arch="));
    }
    assert.equal((legacy.match(/  - url:/g) ?? []).length, architectures.length);
  });
}
