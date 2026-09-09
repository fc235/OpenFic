import { expect, test } from "@playwright/test";

const fixtureUrl = process.env.HISTORY_TEST_URL ?? "http://127.0.0.1:5175/e2e/history-harness.html";

test.beforeEach(async ({ page }) => {
  await page.goto(fixtureUrl);
  await page.waitForFunction(() => Boolean((window as any).historySession));
  await page.evaluate(() => {
    (window as any).historySession.loadSession(
      "session-a",
      Array.from({ length: 30 }, (_, i) => ({
        id: `recent-${i}`,
        type: "user_request",
        role: "user",
        revisionId: `rev-${i}`,
        status: "completed",
        display: "list",
        timestamp: Date.now(),
        content: `Recent message ${i}`,
      })),
      {
        historyTask: {
          id: "task-a",
          agentSessionId: "session-a",
          createdAt: new Date().toISOString(),
          hasMoreMessages: true,
          nextBeforeSeq: 100,
        },
      },
    );
  });
  await expect
    .poll(() => page.locator(".ai-sidebar-messages").evaluate((el) => el.scrollTop))
    .toBeGreaterThan(100);
  // Wait for the initial bottom-restoration animation to settle before scrolling.
  await page.evaluate(async () => {
    let previous = -1;
    let stableFrames = 0;
    while (stableFrames < 8) {
      await new Promise(requestAnimationFrame);
      const current = document.querySelector(".ai-sidebar-messages")!.scrollTop;
      stableFrames = current === previous ? stableFrames + 1 : 0;
      previous = current;
    }
  });
});

test("an empty projected page advances the cursor and older history remains loadable", async ({
  page,
}) => {
  const cursors: string[] = [];
  await page.route("**/tasks/task-a/messages?*", async (route) => {
    cursors.push(new URL(route.request().url()).searchParams.get("before_seq")!);
    await route.fulfill({
      json:
        cursors.length === 1
          ? { messages: [], has_more: true, next_before_seq: 50 }
          : {
              messages: [
                {
                  id: "old-visible",
                  role: "user",
                  content: "Old visible message",
                  created_at: new Date().toISOString(),
                },
              ],
              has_more: false,
              next_before_seq: null,
            },
    });
  });
  await page.evaluate(() => (window as any).historySession.loadOlderMessages());
  await expect
    .poll(() => page.evaluate(() => (window as any).historySession.isLoadingOlderMessages))
    .toBe(false);
  await page.evaluate(() => (window as any).historySession.loadOlderMessages());
  expect(cursors).toEqual(["100", "50"]);
  await expect
    .poll(() => page.evaluate(() => (window as any).historySession.messages[0].id))
    .toBe("old-visible");
});

test("rollback rejects an in-flight old page and retains access to earlier history", async ({
  page,
}) => {
  let finish: (() => void) | undefined;
  await page.route("**/tasks/task-a/messages?*", async (route) => {
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
    await route.fulfill({
      json: {
        messages: [
          {
            id: "stale",
            role: "user",
            content: "Stale history",
            created_at: new Date().toISOString(),
          },
        ],
        has_more: false,
        next_before_seq: null,
      },
    });
  });
  await page.route("**/agent/sessions/session-a/rollback", (route) =>
    route.fulfill({
      json: {
        success: true,
        restored_message_content: "Recent message 10",
        restored_attachments: [],
      },
    }),
  );
  await page.route("**/agent/sessions/session-a/changes", (route) => route.fulfill({ json: {} }));
  await page.evaluate(() => {
    void (window as any).historySession.loadOlderMessages();
  });
  await expect.poll(() => Boolean(finish)).toBe(true);
  await page.evaluate(() => (window as any).historySession.rollbackToRevision("recent-10"));
  finish?.();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).historySession.messages.map((message: any) => message.id),
      ),
    )
    .toEqual(Array.from({ length: 10 }, (_, index) => `recent-${index}`));
  await expect
    .poll(() => page.evaluate(() => (window as any).historySession.hasMoreMessages))
    .toBe(true);
});

test("prepending into an existing assistant block keeps its visible content anchored", async ({
  page,
}) => {
  await page.evaluate(() => {
    (window as any).historySession.loadSession(
      "assistant-session",
      Array.from({ length: 30 }, (_, i) => ({
        id: `assistant-${i}`,
        type: "text",
        role: "assistant",
        status: "completed",
        display: "list",
        timestamp: Date.now(),
        content: `Assistant paragraph ${i}`,
      })),
      {
        historyTask: {
          id: "task-a",
          agentSessionId: "assistant-session",
          createdAt: new Date().toISOString(),
          hasMoreMessages: true,
          nextBeforeSeq: 100,
        },
      },
    );
  });
  await expect
    .poll(() => page.locator(".ai-sidebar-messages").evaluate((el) => el.scrollTop))
    .toBeGreaterThan(100);
  await page.evaluate(async () => {
    for (let i = 0; i < 10; i++) await new Promise(requestAnimationFrame);
  });
  await page.route("**/tasks/task-a/messages?*", (route) =>
    route.fulfill({
      json: {
        messages: Array.from({ length: 20 }, (_, i) => ({
          id: `old-assistant-${i}`,
          role: "assistant",
          message_type: "text",
          content: `Older paragraph ${i}`,
          created_at: new Date().toISOString(),
        })),
        has_more: false,
        next_before_seq: null,
      },
    }),
  );
  await page.locator(".ai-sidebar-messages").evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).historySession.messages.length))
    .toBe(50);
  await expect(page.getByText("Assistant paragraph 0", { exact: true })).toBeInViewport();
});

test("scrolling to the top loads older history and preserves the visible anchor", async ({
  page,
}) => {
  await page.route("**/tasks/task-a/messages?*", async (route) => {
    expect(new URL(route.request().url()).searchParams.get("before_seq")).toBe("100");
    await route.fulfill({
      json: {
        messages: Array.from({ length: 20 }, (_, i) => ({
          id: `old-${i}`,
          role: "user",
          content: `Older message ${i}`,
          created_at: new Date().toISOString(),
        })),
        has_more: false,
        next_before_seq: null,
      },
    });
  });
  await page.locator(".ai-sidebar-messages").evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).historySession.messages.length))
    .toBe(50);
  await expect
    .poll(() => page.locator(".ai-sidebar-messages").evaluate((el) => el.scrollTop))
    .toBeGreaterThan(100);
  await expect(page.getByText("Recent message 0", { exact: true })).toBeInViewport();
});

test("failed history requests expose retry and a stale page cannot enter another session", async ({
  page,
}) => {
  let requests = 0;
  let finish: (() => void) | undefined;
  await page.route("**/tasks/task-a/messages?*", async (route) => {
    requests++;
    if (requests === 1) return route.fulfill({ status: 500, json: { detail: "failed" } });
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
    await route.fulfill({
      json: {
        messages: [
          {
            id: "old",
            role: "user",
            content: "Stale old message",
            created_at: new Date().toISOString(),
          },
        ],
        has_more: false,
        next_before_seq: null,
      },
    });
  });
  await page.locator(".ai-sidebar-messages").evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect(page.getByRole("button", { name: /重试|Retry/ })).toBeVisible();
  await page.getByRole("button", { name: /重试|Retry/ }).click();
  await expect.poll(() => requests).toBe(2);
  await page.evaluate(() =>
    (window as any).historySession.loadSession("session-b", [
      {
        id: "new-session",
        type: "user_request",
        role: "user",
        content: "New session",
        timestamp: Date.now(),
      },
    ]),
  );
  finish?.();
  await expect(page.getByText("New session", { exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).historySession.messages.map((m: any) => m.id)))
    .toEqual(["new-session"]);
});
