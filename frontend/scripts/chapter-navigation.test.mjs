import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getChapterLineTarget,
  resolveChapterLine,
} from "../src/features/writing/lib/chapter-navigation.ts";
import { useChapterNavigationStore } from "../src/features/writing/store/use-chapter-navigation-store.ts";

const line = (type, before, after, text) => ({
  type,
  before_line_number: before,
  after_line_number: after,
  text,
});

test("only the latest request can publish or consume a navigation target", () => {
  const store = useChapterNavigationStore.getState();
  const old = store.begin();
  const current = store.begin();
  const target = { id: current, projectId: "p", chapterId: "b", title: "B", line: 5 };
  store.publish({ ...target, id: old });
  assert.equal(useChapterNavigationStore.getState().request, null);
  store.publish(target);
  store.consume(old);
  assert.deepEqual(useChapterNavigationStore.getState().request, target);
  store.consume(current);
  assert.equal(useChapterNavigationStore.getState().request, null);
});

test("chapter targets its first change rather than preceding context", () => {
  assert.deepEqual(
    getChapterLineTarget([line("context", 5, 5, "context"), line("added", null, 6, "new")]),
    { line: 6, text: "new" },
  );
  assert.deepEqual(getChapterLineTarget([]), { line: 1 });
});

test("removed lines target the next surviving line, not deleted text", () => {
  const lines = [line("removed", 4, null, "gone"), line("added", null, 4, "replacement")];
  assert.deepEqual(getChapterLineTarget(lines, 0), { line: 4, text: "replacement" });
  assert.deepEqual(getChapterLineTarget([line("removed", 8, null, "gone")], 0), { line: 8 });
});

test("historical text matches the closest current paragraph", () => {
  assert.equal(resolveChapterLine(["same", "other", "same", "end"], { line: 4, text: "same" }), 3);
});

test("sparse diffs resolve deletions by line distance, not array proximity", () => {
  const lines = [
    line("removed", 1, null, "old first"),
    line("added", null, 1, "new first"),
    line("removed", 150, null, "gone"),
    line("removed", 200, null, "old last"),
    line("added", null, 199, "new last"),
  ];
  assert.deepEqual(getChapterLineTarget(lines, 2), { line: 199, text: "new last" });
});

test("deletion targets account for preceding insertions and deletions", () => {
  const inserted = Array.from({ length: 100 }, (_, i) =>
    line("added", null, i + 1, `inserted ${i + 1}`),
  );
  const lines = [
    ...inserted,
    line("removed", 150, null, "gone"),
    line("removed", 200, null, "old last"),
    line("added", null, 299, "new last"),
  ];
  assert.deepEqual(getChapterLineTarget(lines, 100), { line: 299, text: "new last" });
  assert.deepEqual(
    getChapterLineTarget([line("removed", 5, null, "a"), line("removed", 6, null, "b")], 1),
    { line: 5 },
  );
});

test("missing historical text and invalid lines clamp to current content", () => {
  assert.equal(resolveChapterLine(["one", "two"], { line: 99, text: "gone" }), 2);
  assert.equal(resolveChapterLine([], { line: 99 }), 1);
  assert.equal(resolveChapterLine(["one"], { line: NaN }), 1);
  assert.equal(resolveChapterLine(["one", "two"], { line: -5 }), 1);
  assert.equal(resolveChapterLine(["", "two"], { line: 2, text: "" }), 2);
});
