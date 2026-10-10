export interface ChapterLineTarget {
  line: number;
  text?: string;
}

interface DiffLine {
  type: "context" | "added" | "removed";
  before_line_number: number | null;
  after_line_number: number | null;
  text: string;
}

export function getChapterLineTarget(lines: DiffLine[], index?: number): ChapterLineTarget {
  const targetIndex = index ?? lines.findIndex((line) => line.type !== "context");
  const target = lines[targetIndex];
  if (!target) return { line: 1 };
  if (target.after_line_number !== null) {
    return { line: target.after_line_number, text: target.text };
  }
  // Diff coordinates before a deletion must be shifted into the current document.
  const shift = lines
    .slice(0, targetIndex)
    .reduce(
      (delta, line) => delta + (line.type === "added" ? 1 : line.type === "removed" ? -1 : 0),
      0,
    );
  const expected = Math.max(1, (target.before_line_number ?? 1) + shift);
  let closest: DiffLine | undefined;
  for (const candidate of lines) {
    if (candidate.after_line_number === null) continue;
    const distance = Math.abs(candidate.after_line_number - expected);
    const closestDistance =
      closest?.after_line_number != null
        ? Math.abs(closest.after_line_number - expected)
        : Infinity;
    if (
      distance < closestDistance ||
      (distance === closestDistance && candidate.after_line_number >= expected)
    )
      closest = candidate;
  }
  if (closest?.after_line_number != null)
    return { line: closest.after_line_number, text: closest.text };
  return { line: expected };
}

export function resolveChapterLine(lines: string[], target: ChapterLineTarget): number {
  const expected = Number.isFinite(target.line) ? Math.max(1, Math.trunc(target.line)) : 1;
  if (target.text?.trim()) {
    let closest: number | undefined;
    lines.forEach((text, index) => {
      const line = index + 1;
      if (
        text === target.text &&
        (closest === undefined || Math.abs(line - expected) < Math.abs(closest - expected))
      ) {
        closest = line;
      }
    });
    if (closest !== undefined) return closest;
  }
  return Math.min(expected, Math.max(1, lines.length));
}
