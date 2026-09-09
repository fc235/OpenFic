interface HistoryMessage {
  id: string;
  type?: string;
  payload?: Record<string, unknown>;
  toolResult?: Record<string, unknown>;
}

function toolIdentity(message: HistoryMessage): unknown {
  return message.type === "tool"
    ? (message.payload?.tool_call_id ?? message.toolResult?.tool_call_id)
    : undefined;
}

export function prependOlderMessages<T extends HistoryMessage>(current: T[], older: T[]): T[] {
  const seen = new Set(current.map((message) => message.id));
  const seenTools = new Set(current.map(toolIdentity).filter(Boolean));
  const added = older.filter((message) => {
    const toolId = toolIdentity(message);
    if (seen.has(message.id) || (toolId && seenTools.has(toolId))) return false;
    seen.add(message.id);
    if (toolId) seenTools.add(toolId);
    return true;
  });
  return added.length ? [...added, ...current] : current;
}

export function mergeTaskMetadata<T extends object>(
  current: T | undefined,
  metadata: Partial<T>,
): T | undefined {
  return current ? { ...current, ...metadata } : undefined;
}
