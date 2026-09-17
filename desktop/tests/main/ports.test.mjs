import assert from "node:assert/strict";
import net from "node:net";
import test from "node:test";
import * as ports from "../../dist/main/ports.js";

test("LAN startup uses 18473 even when a previous port is supplied", async () => {
  assert.equal(typeof ports.resolveBackendPort, "function");
  assert.equal(ports.LAN_PORT, 18473);
  assert.equal(await ports.resolveBackendPort(true), 18473);
  assert.equal(await ports.resolveBackendPort(true, 18001), 18473);
});

test("occupied LAN port reports the fixed port without fallback", async t => {
  assert.equal(typeof ports.resolveBackendPort, "function");
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(18473, "0.0.0.0", resolve);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  await assert.rejects(ports.resolveBackendPort(true), /18473.*EADDRINUSE/);
});

test("local startup allocates a free port and preserves a preferred port", async () => {
  assert.equal(typeof ports.resolveBackendPort, "function");
  const port = await ports.resolveBackendPort(false);
  assert.ok(Number.isInteger(port) && port > 0 && port <= 65535);
  assert.equal(await ports.resolveBackendPort(false, 18001), 18001);
});
