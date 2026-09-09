import { expect, test } from "@playwright/test";

test("native completion notification fires once for a live successful round", async ({ page }) => {
  await page.route("**/api/v1/agent/sessions/**", (route) => route.fulfill({ json: {} }));
  await page.goto("http://127.0.0.1:5175/e2e/history-harness.html");
  await page.waitForFunction(() => Boolean((window as any).historySession));
  const notifications = await page.evaluate(async () => {
    const notices: unknown[] = [];
    (window as any).openficDesktopHost = { notifySessionCompleted: (payload: unknown) => { notices.push(payload); return Promise.resolve(true); } };
    const modulePath = "/src/lib/socket-client.ts";
    const { getSocket } = await import(/* @vite-ignore */ modulePath);
    const socket = getSocket();
    const emit = (name: string, data: unknown) => socket.listeners(name).forEach((handler: (data: unknown) => void) => handler(data));
    const session = (window as any).historySession;
    // Loading completed history itself must not notify.
    session.loadSession("session-a", [], { reconnect: false });
    const before = notices.length;
    session.loadSession("session-a", [], { reconnect: true, isRemoteRunning: true });
    emit("agent:done", { session_id: "other-session", created_at: "2026-09-09T12:00:00Z" });
    emit("agent:done", { session_id: "session-a", created_at: "2026-09-09T12:00:00Z" });
    emit("agent:done", { session_id: "session-a", created_at: "2026-09-09T12:00:00Z" });
    const afterSuccess = notices.length;
    session.loadSession("session-a", [], { reconnect: true, isRemoteRunning: true });
    emit("agent:error", { session_id: "session-a", message: "failed" });
    emit("agent:done", { session_id: "session-a", created_at: "2026-09-09T12:01:00Z" });
    const afterError = notices.length;
    session.loadSession("session-a", [], { reconnect: true, isRemoteRunning: true });
    emit("agent:done", { session_id: "session-a", created_at: "2026-09-09T12:02:00Z" });
    const afterNextRound = notices.length;
    session.loadSession("session-a", [], { reconnect: true, isRemoteRunning: true });
    await session.abortSession();
    emit("agent:done", { session_id: "session-a", created_at: "2026-09-09T12:03:00Z" });
    session.disconnectTransport();
    return { before, afterSuccess, afterError, afterNextRound, afterAbort: notices.length };
  });
  expect(notifications).toEqual({ before: 0, afterSuccess: 1, afterError: 1, afterNextRound: 2, afterAbort: 2 });
});
