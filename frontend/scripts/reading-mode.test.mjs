import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_READING_PREFERENCES,
  getReadingLayout,
  getReadingPageTarget,
  isReadingKeyAllowed,
  normalizeReadingPreferences,
  resolveReadingShortcut,
} from "../src/features/writing/lib/reading-mode.ts";

const event = (key, extras = {}) => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  isComposing: false,
  repeat: false,
  ...extras,
});

test("empty and short chapters each occupy one page", () => {
  for (const scrollHeight of [0, 100, 600]) {
    const layout = getReadingLayout(600, scrollHeight, 0);
    assert.deepEqual(layout, { step: 560, maxScrollTop: 0, pageCount: 1, pageIndex: 0 });
    assert.deepEqual(getReadingPageTarget("previous", layout), { scrollTop: 0, chapterDelta: -1 });
    assert.deepEqual(getReadingPageTarget("next", layout), { scrollTop: 0, chapterDelta: 1 });
  }
});

test("paging traverses exact multiples without adding an extra page", () => {
  const first = getReadingLayout(600, 1720, 0);
  assert.equal(first.pageCount, 3);
  assert.deepEqual(getReadingPageTarget("next", first), { scrollTop: 560, chapterDelta: 0 });
  assert.deepEqual(getReadingPageTarget("previous", getReadingLayout(600, 1720, 560)), {
    scrollTop: 0,
    chapterDelta: 0,
  });
  assert.deepEqual(getReadingPageTarget("next", getReadingLayout(600, 1720, 1120)), {
    scrollTop: 1120,
    chapterDelta: 1,
  });
});

test("short final page is recognized as last and previous returns to prior ordinal", () => {
  const penultimate = getReadingLayout(600, 1730, 1120);
  assert.equal(penultimate.pageCount, 4);
  assert.equal(penultimate.pageIndex, 2);
  assert.deepEqual(getReadingPageTarget("next", penultimate), { scrollTop: 1130, chapterDelta: 0 });
  const last = getReadingLayout(600, 1730, 1130);
  assert.equal(last.pageIndex, 3);
  assert.deepEqual(getReadingPageTarget("previous", last), { scrollTop: 1120, chapterDelta: 0 });
  assert.deepEqual(getReadingPageTarget("next", last), { scrollTop: 1130, chapterDelta: 1 });
});

test("invalid dimensions and scroll positions yield finite clamped metrics", () => {
  for (const height of [0, -10, NaN, Infinity, 1, 20, 40]) {
    const layout = getReadingLayout(height, 100, Infinity);
    assert.ok(layout.step > 0);
    assert.ok(layout.pageCount >= 1);
    assert.equal(layout.pageIndex, 0);
    assert.ok(Object.values(layout).every(Number.isFinite));
  }
  assert.equal(getReadingLayout(600, NaN, -50).maxScrollTop, 0);
  assert.equal(getReadingLayout(600, 1730, 10000).pageIndex, 3);
  assert.equal(getReadingLayout(600, 1730, -10).pageIndex, 0);
});

test("preferences normalize letters and remove duplicate bindings", () => {
  assert.deepEqual(
    normalizeReadingPreferences({
      previousKeys: ["K", "k"],
      nextKeys: [" ", "J"],
      autoTurnSeconds: 1.5,
    }),
    {
      previousKeys: ["k"],
      nextKeys: [" ", "j"],
      autoTurnSeconds: 1.5,
    },
  );
  for (const autoTurnSeconds of [1, 3600]) {
    assert.equal(normalizeReadingPreferences({ autoTurnSeconds }).autoTurnSeconds, autoTurnSeconds);
  }
});

test("invalid or colliding bindings restore safe defaults", () => {
  for (const raw of [
    null,
    [],
    "wrong",
    {},
    { previousKeys: [], nextKeys: ["j"] },
    { previousKeys: ["K"], nextKeys: ["k"] },
    { previousKeys: ["Escape"], nextKeys: ["j"] },
    { previousKeys: [42], nextKeys: ["j"] },
    { previousKeys: ["k"], nextKeys: "j" },
  ]) {
    assert.deepEqual(normalizeReadingPreferences(raw), DEFAULT_READING_PREFERENCES);
  }
  for (const autoTurnSeconds of [0, -1, 3601, NaN, Infinity, "10"]) {
    assert.equal(normalizeReadingPreferences({ autoTurnSeconds }).autoTurnSeconds, 10);
  }
});

test("normalization returns independent preference arrays", () => {
  const normalized = normalizeReadingPreferences(null);
  normalized.previousKeys.push("z");
  assert.deepEqual(normalizeReadingPreferences(null).previousKeys, ["ArrowLeft", "ArrowUp"]);
});

test("allowed keys exclude reserved browser, OS, modifiers, composition, and whitespace", () => {
  for (const key of [
    "Escape",
    "Tab",
    "Enter",
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "OS",
    "F1",
    "F5",
    "F11",
    "BrowserBack",
    "Backspace",
    "Dead",
    "Process",
    "Unidentified",
    "",
    "\t",
    "\n",
    "  ",
  ]) {
    assert.equal(isReadingKeyAllowed(key), false, key);
  }
  for (const key of [
    "ArrowLeft",
    "ArrowUp",
    "ArrowRight",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    " ",
    "J",
    "中",
    ".",
    "9",
  ]) {
    assert.equal(isReadingKeyAllowed(key), true, key);
  }
});

test("default shortcuts support both axes and custom bindings support case and space", () => {
  for (const key of ["ArrowLeft", "ArrowUp"])
    assert.equal(resolveReadingShortcut(event(key), DEFAULT_READING_PREFERENCES), "previous");
  for (const key of ["ArrowRight", "ArrowDown"])
    assert.equal(resolveReadingShortcut(event(key), DEFAULT_READING_PREFERENCES), "next");
  const custom = normalizeReadingPreferences({
    previousKeys: ["k"],
    nextKeys: ["j", " "],
    autoTurnSeconds: 10,
  });
  assert.equal(resolveReadingShortcut(event("K"), custom), "previous");
  assert.equal(resolveReadingShortcut(event("J"), custom), "next");
  assert.equal(resolveReadingShortcut(event(" "), custom), "next");
  assert.equal(resolveReadingShortcut(event("ArrowDown"), custom), null);
});

test("shortcuts ignore modified keys, composition, held keys, and unknown keys", () => {
  for (const flag of ["ctrlKey", "metaKey", "altKey", "isComposing", "repeat"]) {
    assert.equal(
      resolveReadingShortcut(event("ArrowDown", { [flag]: true }), DEFAULT_READING_PREFERENCES),
      null,
    );
  }
  assert.equal(resolveReadingShortcut(event("Escape"), DEFAULT_READING_PREFERENCES), null);
});
