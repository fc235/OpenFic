import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  resolveBundledOpenFicWheel,
  selectBundledOpenFicWheel,
} from "../../dist/main/runtime/bundled-backend.js";
import { createOpenFicInstallCommand } from "../../dist/main/runtime/openfic-commands.js";

test("beta desktop selects the PEP 440 wheel without accepting the stable wheel", () => {
  assert.equal(selectBundledOpenFicWheel([
    "openfic-1.0.4-py3-none-any.whl", "openfic-1.0.4b0-py3-none-any.whl",
  ], "1.0.4-beta"), "openfic-1.0.4b0-py3-none-any.whl");
  assert.equal(selectBundledOpenFicWheel(["openfic-1.0.4b0-py3-none-any.whl"], "1.0.4"), null);
});

test("beta PyPI fallback uses a Python-compatible version", () => {
  assert.equal(createOpenFicInstallCommand("python", "1.0.4-beta").args.at(-1), "openfic==1.0.4b0");
});

test("selects the wheel whose normalized version exactly matches", () => {
  assert.equal(
    selectBundledOpenFicWheel(
      ["openfic-0.11.0-py3-none-any.whl", "openfic-1.0.0-py3-none-any.whl"],
      "1.0.0",
    ),
    "openfic-1.0.0-py3-none-any.whl",
  );
});

test("rejects duplicate wheels for the expected version", () => {
  assert.throws(
    () => selectBundledOpenFicWheel(
      ["openfic-1.0.0-py3-none-any.whl", "OpenFic-1.0.0-py3-none-win_amd64.whl"],
      "1.0.0",
    ),
    /多个 OpenFic 1\.0\.0 后端包/,
  );
});

test("a packaged runtime requires a matching wheel", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "openfic-wheel-"));
  try {
    const backendDir = path.join(root, "backend-dist");
    await mkdir(backendDir);
    await writeFile(path.join(backendDir, "openfic-0.11.0-py3-none-any.whl"), "test");
    await assert.rejects(
      resolveBundledOpenFicWheel(root, "1.0.0", true),
      /未找到 OpenFic 1\.0\.0 后端包/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a source runtime may fall back when backend-dist is absent", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "openfic-wheel-"));
  try {
    assert.equal(await resolveBundledOpenFicWheel(root, "1.0.0", false), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("installs a supplied bundled wheel instead of resolving OpenFic by version", () => {
  const wheelPath = "C:\\packages\\openfic-1.0.0-py3-none-any.whl";

  const command = createOpenFicInstallCommand("C:\\runtime\\venv\\Scripts\\python.exe", "1.0.0", false, wheelPath);

  assert.equal(command.args.at(-1), wheelPath);
});
