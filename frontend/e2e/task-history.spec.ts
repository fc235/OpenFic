import { expect, test } from "@playwright/test";

import {
  mergeTaskMetadata,
  prependOlderMessages,
} from "../src/features/assistant/lib/task-history";

test("prepending history preserves the live duplicate and removes repeated page IDs", () => {
  const live = { id: "current", content: "live streaming text" };
  expect(
    prependOlderMessages(
      [live],
      [
        { id: "old", content: "older text" },
        { id: "old", content: "duplicate" },
        { id: "current", content: "stale persisted text" },
      ],
    ),
  ).toEqual([{ id: "old", content: "older text" }, live]);
});

test("metadata responses preserve cached history and do not create incomplete task details", () => {
  const cached = {
    id: "task",
    title: "before",
    messages: [{ id: "message" }],
    hasMoreMessages: true,
    nextBeforeSeq: 90,
  };
  expect(mergeTaskMetadata(cached, { id: "task", title: "after" })).toEqual({
    ...cached,
    title: "after",
  });
  expect(mergeTaskMetadata(undefined, { id: "task", title: "after" })).toBeUndefined();
});

test("tool pages with different row IDs retain the latest tool call", () => {
  const live = {
    id: "tool-final",
    type: "tool",
    payload: { tool_call_id: "call-1" },
    content: "done",
  };
  expect(
    prependOlderMessages(
      [live],
      [
        {
          id: "tool-pending",
          type: "tool",
          payload: { tool_call_id: "call-1" },
          content: "pending",
        },
      ],
    ),
  ).toEqual([live]);
});
