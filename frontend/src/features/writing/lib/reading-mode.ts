export type ReadingPreferences = {
  previousKeys: string[];
  nextKeys: string[];
  autoTurnSeconds: number;
};

export type ReadingLayout = {
  step: number;
  maxScrollTop: number;
  pageCount: number;
  pageIndex: number;
};

export const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  previousKeys: ["ArrowLeft", "ArrowUp"],
  nextKeys: ["ArrowRight", "ArrowDown"],
  autoTurnSeconds: 10,
};

const navigationKeys = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key;
}

export function isReadingKeyAllowed(key: string): boolean {
  return navigationKeys.has(key) || key === " " || (key.length === 1 && !/[\s\p{C}]/u.test(key));
}

function normalizeKeys(raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (!raw.every((key): key is string => typeof key === "string" && isReadingKeyAllowed(key))) {
    return null;
  }
  return [...new Set(raw.map(normalizeKey))];
}

export function normalizeReadingPreferences(raw: unknown): ReadingPreferences {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const previous = normalizeKeys(source.previousKeys);
  const next = normalizeKeys(source.nextKeys);
  const validKeys = previous && next && !previous.some((key) => next.includes(key));
  const seconds = source.autoTurnSeconds;
  return {
    previousKeys: validKeys ? previous : [...DEFAULT_READING_PREFERENCES.previousKeys],
    nextKeys: validKeys ? next : [...DEFAULT_READING_PREFERENCES.nextKeys],
    autoTurnSeconds:
      typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 1 && seconds <= 3600
        ? seconds
        : DEFAULT_READING_PREFERENCES.autoTurnSeconds,
  };
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function getReadingLayout(
  height: number,
  scrollHeight: number,
  scrollTop: number,
): ReadingLayout {
  const viewport = nonNegativeFinite(height);
  // Keep at least half a viewport available when the viewport is smaller than the overlap.
  const step = Math.max(1, viewport - Math.min(40, viewport / 2));
  const maxScrollTop = Math.max(0, nonNegativeFinite(scrollHeight) - viewport);
  const top = Math.min(maxScrollTop, nonNegativeFinite(scrollTop));
  // Chromium can round scrollTop to fractional CSS pixels at desktop zoom/DPI.
  // Accept that rounding at page boundaries instead of turning to the same page again.
  const tolerance = Math.min(1, step / 4);
  const pageCount = Math.ceil(Math.max(0, maxScrollTop - tolerance) / step) + 1;
  const pageIndex =
    maxScrollTop - top <= tolerance
      ? pageCount - 1
      : Math.min(pageCount - 1, Math.floor((top + tolerance) / step));
  return { step, maxScrollTop, pageCount, pageIndex };
}

export function getReadingPageTarget(
  direction: "previous" | "next",
  layout: ReadingLayout,
): { scrollTop: number; chapterDelta: -1 | 0 | 1 } {
  const { step, maxScrollTop, pageCount, pageIndex } = layout;
  if (direction === "previous" && pageIndex === 0) return { scrollTop: 0, chapterDelta: -1 };
  if (direction === "next" && pageIndex === pageCount - 1)
    return { scrollTop: maxScrollTop, chapterDelta: 1 };
  const targetIndex = pageIndex + (direction === "next" ? 1 : -1);
  return { scrollTop: Math.max(0, Math.min(maxScrollTop, targetIndex * step)), chapterDelta: 0 };
}

export function resolveReadingShortcut(
  event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey" | "isComposing" | "repeat">,
  preferences: ReadingPreferences,
): "previous" | "next" | null {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.repeat)
    return null;
  const key = normalizeKey(event.key);
  if (preferences.previousKeys.some((binding) => normalizeKey(binding) === key)) return "previous";
  if (preferences.nextKeys.some((binding) => normalizeKey(binding) === key)) return "next";
  return null;
}
