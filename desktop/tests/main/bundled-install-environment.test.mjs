import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";

test("bundled installs and certificate retries preserve the dependency index and system/PAC proxy", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "openfic-install-env-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const runtimeDir = path.join(root, "runtime");
  const binDir = path.join(runtimeDir, "venv", process.platform === "win32" ? "Scripts" : "bin");
  await mkdir(binDir, { recursive: true });
  await writeFile(path.join(binDir, process.platform === "win32" ? "python.exe" : "python"), "fixture");
  const proxyRequests = [];
  const indexProbes = [];
  t.mock.module("electron", {
    namedExports: {
      app: { getPath: () => root },
      net: { fetch: (url) => { indexProbes.push(url); throw new Error("Network disabled in test"); } },
      session: { defaultSession: {
        setProxy: async () => {},
        resolveProxy: async (url) => { proxyRequests.push(url); return "PROXY proxy.example:8080; DIRECT"; },
      } },
    },
  });
  const installs = [];
  t.mock.module("node:child_process", {
    namedExports: { spawn: (_command, args, options) => {
      const child = new EventEmitter();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      const isInstall = args.includes("install");
      if (isInstall) installs.push({ args, environment: options.env });
      const retry = isInstall && args.at(-1).endsWith(".whl") && !args.includes("--system-certs");
      queueMicrotask(() => {
        child.stdout.end(args[0] === "--version" ? "Python 3.12.0" : "");
        child.stderr.end(retry ? "Consider enabling use of system TLS certificates\n" : "");
        child.emit("exit", retry ? 1 : 0);
      });
      return child;
    } },
  });
  const { ensureOpenFicRuntime } = await import("../../dist/main/runtime/openfic.js");
  const wheelPath = path.join(root, "openfic-1.0.0-py3-none-any.whl");
  await ensureOpenFicRuntime({ pythonPath: "unused", wasReplaced: false }, runtimeDir, "1.0.0", () => {}, wheelPath);

  assert.equal(installs.length, 3, "uv bootstrap plus wheel installation and its certificate retry");
  assert.deepEqual(indexProbes, [], "A bundled backend must not probe OpenFic on PyPI");
  assert.deepEqual(proxyRequests, ["https://pypi.org/simple/"]);
  for (const { environment } of installs) {
    for (const key of ["PIP_INDEX_URL", "UV_INDEX_URL", "pip_index_url", "uv_index_url"]) {
      assert.equal(environment[key], "https://pypi.org/simple/");
    }
    for (const key of ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]) {
      assert.equal(environment[key], "http://proxy.example:8080");
    }
    assert.ok(environment.NO_PROXY.split(",").includes("127.0.0.1"));
    assert.equal(environment.no_proxy, environment.NO_PROXY);
  }
  assert.equal(installs[1].args.at(-1), wheelPath);
  assert.equal(installs[2].args.at(-1), wheelPath);
  assert.equal(installs[2].args[0], "--system-certs");
});
