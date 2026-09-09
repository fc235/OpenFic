import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

test("completion notifications validate the sender, deduplicate, and restore the window on click", async (t) => {
  const shown = [];
  let supported = true;
  class FakeNotification extends EventEmitter {
    static isSupported() { return supported; }
    constructor(options) { super(); this.options = options; }
    show() { shown.push(this); }
  }
  t.mock.module("electron", { namedExports: { Notification: FakeNotification } });
  const { notifySessionCompleted } = await import("../../dist/main/session-notifications.js");
  const actions = [];
  const host = {};
  const window = {
    webContents: host, isDestroyed: () => false, isMinimized: () => true,
    restore: () => actions.push("restore"), show: () => actions.push("show"), focus: () => actions.push("focus"),
  };
  const sender = { id: 42, hostWebContents: host, isDestroyed: () => false };
  const payload = { sessionId: "session-a", completionId: "round-a", title: "OpenFic", body: "会话已完成" };
  assert.equal(notifySessionCompleted(window, { ...sender, hostWebContents: {} }, payload), false);
  assert.equal(notifySessionCompleted(window, sender, {}), false);
  assert.equal(notifySessionCompleted(window, sender, payload), true);
  assert.equal(notifySessionCompleted(window, sender, payload), false);
  assert.equal(shown.length, 1);
  assert.equal(shown[0].options.body, "会话已完成");
  shown[0].emit("click");
  assert.deepEqual(actions, ["restore", "show", "focus"]);
  assert.equal(notifySessionCompleted(window, sender, { ...payload, completionId: "round-b" }), true);
  supported = false;
  assert.equal(notifySessionCompleted(window, sender, { ...payload, completionId: "round-c" }), false);
});
