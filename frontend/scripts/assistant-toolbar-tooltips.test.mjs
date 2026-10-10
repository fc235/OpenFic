import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = ts.createSourceFile(
  "assistant-sidebar.tsx",
  readFileSync(
    new URL("../src/features/assistant/components/assistant-sidebar.tsx", import.meta.url),
    "utf8",
  ),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

for (const [label, handler] of [
  ["assistant.history", "openAllTasks"],
  ["assistant.newTask", "backToTaskList"],
]) {
  test(`${label} toolbar button has a matching hover tooltip`, () => {
    const buttons = [];
    function visit(node) {
      if (
        ts.isJsxElement(node) &&
        node.openingElement.tagName.getText(source) === "IconButton" &&
        node.openingElement.attributes.properties.some(
          (attribute) =>
            ts.isJsxAttribute(attribute) &&
            attribute.name.getText(source) === "onClick" &&
            attribute.initializer?.getText(source) === `{${handler}}`,
        )
      ) {
        buttons.push(node);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    assert.equal(buttons.length, 1);
    const tooltip = buttons[0].parent;
    assert.ok(ts.isJsxElement(tooltip));
    assert.equal(tooltip.openingElement.tagName.getText(source), "Tooltip");
    const content = tooltip.openingElement.attributes.properties.find(
      (attribute) =>
        ts.isJsxAttribute(attribute) && attribute.name.getText(source) === "content",
    );
    assert.equal(content?.initializer?.getText(source), `{t("${label}")}`);
  });
}
