import assert from "node:assert/strict";
import { test } from "node:test";

import {
  prependAgentMessages,
  createAgentMessagePagination,
} from "../src/features/assistant/hooks/use-agent-message-pagination.ts";

test("cursor pagination retains the live tool result when history has an older row for the same call", () => {
  const live = { id: "final", type: "tool", payload: { tool_call_id: "call" }, content: "done" };
  assert.deepEqual(
    prependAgentMessages(
      [live],
      [{ id: "pending", type: "tool", payload: { tool_call_id: "call" }, content: "pending" }],
    ),
    [live],
  );
});

test("pagination invalidation rejects in-flight history after a session switch", async () => {
  const controller = createAgentMessagePagination(() => {});
  controller.reset("a", { messagesCursor: 100, messagesHasMore: true });
  let finish;
  const applied = [];
  const request = controller.load(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    (messages) => applied.push(...messages),
  );
  controller.reset("b", { messagesCursor: null, messagesHasMore: false });
  finish({ messages: [{ id: "stale" }], messagesCursor: 50, messagesHasMore: true });
  await request;
  assert.deepEqual(applied, []);
  assert.equal(controller.current.messagesCursor, null);
});
