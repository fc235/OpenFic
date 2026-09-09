import { Notification, type BrowserWindow, type WebContents } from "electron";

const delivered = new Set<string>();
const active = new Set<Notification>();

export function notifySessionCompleted(
  window: BrowserWindow | null,
  sender: WebContents,
  payload: unknown,
): boolean {
  if (!window || window.isDestroyed() || sender.isDestroyed()) return false;
  if (sender.hostWebContents !== window.webContents) return false;
  if (!Notification.isSupported() || !payload || typeof payload !== "object") return false;
  const data = payload as Record<string, unknown>;
  for (const field of ["sessionId", "completionId", "title", "body"]) {
    if (typeof data[field] !== "string" || !data[field].trim() || data[field].length > 256) return false;
  }
  const key = JSON.stringify([sender.id, data.sessionId, data.completionId]);
  if (delivered.has(key)) return false;
  try {
    const notification = new Notification({ title: data.title as string, body: data.body as string });
    notification.on("click", () => {
      if (window.isDestroyed()) return;
      if (window.isMinimized()) window.restore();
      window.show();
      window.focus();
    });
    notification.on("close", () => active.delete(notification));
    notification.on("failed", () => active.delete(notification));
    active.add(notification);
    notification.show();
    delivered.add(key);
    if (delivered.size > 256) delivered.delete(delivered.values().next().value!);
    return true;
  } catch {
    return false;
  }
}
