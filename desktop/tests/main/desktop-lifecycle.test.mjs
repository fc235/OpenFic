import assert from "node:assert/strict";
import test from "node:test";
import { createWindowCloseHandler } from "../../dist/main/window-close.js";
import { createLanRestartController } from "../../dist/main/lan-restart.js";

test("close choice remembers frontend-only, cancellation does not close, saved quit bypasses dialog", async () => {
  let saved = "ask";
  let choice = { behavior: null, remember: true };
  const calls = [];
  const close = createWindowCloseHandler({
    readBehavior: async () => saved,
    choose: async () => { calls.push("dialog"); return choice; },
    remember: async value => { saved = value; },
    closeFrontend: () => calls.push("frontend"), quit: () => calls.push("quit"),
    onError: error => { throw error; },
  });
  await close();
  assert.deepEqual(calls, ["dialog"]);
  choice = { behavior: "frontend", remember: true };
  await close();
  await close();
  assert.deepEqual(calls, ["dialog", "dialog", "frontend", "frontend"]);
  saved = "quit";
  await close();
  assert.equal(calls.at(-1), "quit");
});

test("repeated X clicks share one dialog and a failed preference write keeps the window open", async () => {
  let resolve;
  let dialogs = 0;
  let closed = false;
  let error;
  const close = createWindowCloseHandler({
    readBehavior: async () => "ask",
    choose: () => { dialogs++; return new Promise(r => { resolve = r; }); },
    remember: async () => { throw new Error("disk full"); },
    closeFrontend: () => { closed = true; }, quit: () => { closed = true; },
    onError: value => { error = value; },
  });
  const first = close();
  await Promise.resolve();
  await close();
  resolve({ behavior: "frontend", remember: true });
  await first;
  assert.equal(dialogs, 1);
  assert.equal(closed, false);
  assert.equal(error.message, "disk full");
});

test("LAN restart waits for idle and uses the fixed port", async () => {
  const backend = {baseUrl:"http://127.0.0.1:18001",bindHost:"127.0.0.1",shutdownToken:"test"};
  let busy = true;
  const ports = [];
  const controller = createLanRestartController({
    getBackend: () => backend, isStarting: () => false,
    requestIdleStop: async () => !busy,
    restart: async port => { ports.push(port); backend.bindHost = "0.0.0.0"; },
  });
  await controller.apply(true);
  assert.deepEqual(ports, []);
  assert.equal(controller.isPending(true), true);
  busy = false;
  await controller.apply(true);
  assert.deepEqual(ports, [18473]);
  assert.equal(controller.isPending(true), false);
});

test("disabling LAN preserves the active port and restores local binding", async () => {
  const backend = {baseUrl:"http://127.0.0.1:18473",bindHost:"0.0.0.0",shutdownToken:"test"};
  const ports = [];
  const controller = createLanRestartController({
    getBackend: () => backend, isStarting: () => false,
    requestIdleStop: async () => true,
    restart: async port => { ports.push(port); backend.bindHost = "127.0.0.1"; },
  });
  await controller.apply(false);
  assert.deepEqual(ports, [18473]);
  assert.equal(controller.isPending(false), false);
});

test("a switch or quit during idle check never restarts another backend", async () => {
  const original = {baseUrl:"http://127.0.0.1:18001",bindHost:"127.0.0.1",shutdownToken:"test"};
  let backend = original;
  let resolve;
  let restarted = false;
  const controller = createLanRestartController({
    getBackend: () => backend, isStarting: () => false,
    requestIdleStop: () => new Promise(r => { resolve = r; }),
    restart: async () => { restarted = true; },
  });
  const apply = controller.apply(true);
  let settled = false;
  const waiting = controller.waitForIdle().then(() => { settled = true; });
  assert.equal(settled, false);
  backend = {...original, baseUrl:"http://127.0.0.1:18002"};
  resolve(true);
  await Promise.all([apply, waiting]);
  assert.equal(restarted, false);
  assert.equal(settled, true);
});
