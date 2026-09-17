import assert from "node:assert/strict";
import { test } from "node:test";

import {
  REGISTERED_TOOL_NAMES,
  getToolDescriptorMeta,
  isExploreToolName,
} from "../src/features/assistant/components/agent/message-blocks/tools/shared/tool-message-catalog.ts";

test("write_skill is registered as a skill mutation, not an exploration tool", () => {
  assert.ok(REGISTERED_TOOL_NAMES.includes("write_skill"));
  assert.deepEqual(getToolDescriptorMeta("write_skill"), {
    toolName: "write_skill",
    group: "skill",
    tag: "write",
    isExplore: false,
    contentMode: "hidden",
  });
  assert.equal(isExploreToolName("write_skill"), false);
});
