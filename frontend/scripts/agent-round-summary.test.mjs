import assert from "node:assert/strict";
import { test } from "node:test";

import * as blocksModule from "../src/features/assistant/components/agent/display/agent-message-blocks.ts";

const block = (id, round, type, status = "completed") => ({
  id,
  type,
  agentRoundId: round,
  sourceRevisionId: `revision:${round}`,
  messages: [{ id: `message:${id}`, status }],
});
const blocks = [
  block("old-user", "old", "user"),
  block("old-agent", "old", "agent"),
  block("new-user", "new", "user"),
  block("new-agent", "new", "agent"),
];
const oldSummary = { itemCount: 1 };
const newSummary = { itemCount: 2 };
const changes = {
  turns: [
    { revisionId: "revision:old", changes: oldSummary },
    { revisionId: "revision:new", changes: newSummary },
  ],
};

test("a running session hides only the newest round summary between tool calls", () => {
  assert.equal(typeof blocksModule.buildAgentRoundChangeSummaries, "function");
  const result = blocksModule.buildAgentRoundChangeSummaries(blocks, blocks, changes, true);
  assert.equal(result.get("old-agent"), oldSummary);
  assert.equal(result.has("new-agent"), false);
});

test("completion shows the latest summary at its visible anchor", () => {
  const result = blocksModule.buildAgentRoundChangeSummaries(blocks, blocks, changes, false);
  assert.equal(result.get("new-agent"), newSummary);
});

test("pending output hides a summary even if the session flag is idle", () => {
  const running = [block("new-user", "new", "user"), block("new-agent", "new", "agent", "pending")];
  const result = blocksModule.buildAgentRoundChangeSummaries(running, running, changes, false);
  assert.equal(result.size, 0);
});
