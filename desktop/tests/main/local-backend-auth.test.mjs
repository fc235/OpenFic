import assert from "node:assert/strict";
import test from "node:test";

test("local startup preserves the requested port and access key together", async (t) => {
  t.mock.module("electron", { namedExports: { net: {} } });
  t.mock.module("../../dist/main/logging.js", { namedExports: { appendLog() {}, createLogStream() {} } });
  t.mock.module("../../dist/main/desktop-preferences.js", {
    namedExports: { readDesktopPreferences: async () => ({ lanEnabled: true }) },
  });
  const selections = [];
  t.mock.module("../../dist/main/ports.js", { namedExports: {
    resolveBackendPort: async (...args) => { selections.push(args); return 18473; },
  } });
  t.mock.module("../../dist/main/proxy.js", { namedExports: {
    configureDefaultSystemProxy: async () => {},
    getSystemProxyEnvironment: async () => ({ HTTPS_PROXY: "http://proxy.example:8080" }),
  } });
  let started;
  const handle = { baseUrl: "http://127.0.0.1:18473", process: {} };
  t.mock.module("../../dist/main/process.js", { namedExports: {
    abortStartingBackendProcess() { assert.fail("A healthy backend must stay running"); },
    startBackendProcess: (options) => { started = options; return handle; },
  } });
  t.mock.module("../../dist/main/health.js", { namedExports: {
    throwIfAborted() {}, waitForBackend: async () => ({ status: "healthy", version: "1.3.0" }),
  } });
  t.mock.method(globalThis, "fetch", async () => ({ ok: true, json: async () => ({ status: "ready" }) }));
  const { startLocalOpenFicBackend } = await import("../../dist/main/runtime/openfic.js");
  const result = await startLocalOpenFicBackend("python", "1.3.0", undefined, undefined, "test-data", 18001, "secret-key");
  assert.deepEqual(selections, [[true, 18001]]);
  assert.equal(started.port, 18473);
  assert.equal(started.bindHost, "0.0.0.0");
  assert.equal(started.dataDir, "test-data");
  assert.equal(started.environment.OPENFIC_AUTH_PASSWORD, "secret-key");
  assert.equal(started.environment.HTTPS_PROXY, "http://proxy.example:8080");
  assert.equal(result.handle, handle);
});
