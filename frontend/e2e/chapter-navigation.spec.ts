import { expect, test } from "@playwright/test";

test.setTimeout(30_000);
const harness = "http://127.0.0.1:5173/e2e/chapter-navigation-harness.html";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const chapter = (id: string) => ({
      id,
      project_id: id === "other" ? "other" : "p",
      volume_id: "v",
      title: `Chapter ${id.toUpperCase()}`,
      content: Array.from({ length: 80 }, (_, i) => `paragraph ${i + 1}`).join("\n"),
      order: 1,
      word_count: 160,
      updated_at: "2026-09-17T00:00:00Z",
      created_at: "2026-09-17T00:00:00Z",
    });
    if (path.includes("/chapters/missing"))
      return route.fulfill({ status: 404, json: { detail: "Not found" } });
    if (path.includes("/chapters/"))
      return route.fulfill({ json: chapter(path.split("/").at(-1)!) });
    if (path.endsWith("/chapters"))
      return route.fulfill({
        json: {
          volumes: [{ id: "v", title: "Volume", order: 1, chapters: [chapter("a"), chapter("b")] }],
          total_chapters: 2,
        },
      });
    if (path.endsWith("/notes/tree"))
      return route.fulfill({ json: { categories: [], root_notes: [] } });
    if (path.endsWith("/settings"))
      return route.fulfill({ json: { editor_show_line_numbers: true } });
    return route.fulfill({ json: {} });
  });
  await page.goto(harness);
  await expect(page.locator(".ProseMirror")).toBeVisible();
});

test("chapter names and diff lines open the target and repeat the highlight", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["PATCH", "POST", "PUT"].includes(request.method()) && request.url().includes("/chapters"))
      writes.push(request.url());
  });
  const edit = page.getByTestId("edit");
  await edit.getByRole("button", { name: "跳转到正文: Chapter B", exact: true }).click();
  await expect(page.locator('[data-chapter-navigation-highlight="true"]')).toHaveText(
    "paragraph 25",
  );
  await edit.getByRole("button", { name: "定位到对应段落: paragraph 60", exact: true }).click();
  await expect(page.locator('[data-chapter-navigation-highlight="true"]')).toHaveText(
    "paragraph 60",
  );
  await expect
    .poll(() => page.locator(".tiptap-editor-wrapper").evaluate((el) => el.scrollTop))
    .toBeGreaterThan(500);
  await edit.getByRole("button", { name: "定位到对应段落: paragraph 60", exact: true }).click();
  await expect(page.locator('[data-chapter-navigation-highlight="true"]')).toHaveText(
    "paragraph 60",
  );
  await edit
    .getByRole("button", { name: "定位到对应段落: deleted paragraph", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-chapter-navigation-highlight="true"]')).toHaveText(
    "paragraph 25",
  );
  await page.screenshot({ path: "test-results/chapter-navigation-desktop.png" });
  await expect(page.locator('[data-chapter-navigation-highlight="true"]')).toHaveCount(0, {
    timeout: 4000,
  });
  await page.getByRole("button", { name: "Chapter A", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "章节标题" })).toHaveValue("Chapter A");
  expect(writes).toEqual([]);
});

test("navigation retains unsaved drafts and works while AI locks editing", async ({ page }) => {
  const editor = page.locator(".ProseMirror");
  await editor.click();
  await page.keyboard.press("Control+Home");
  await page.keyboard.insertText("unsaved draft ");
  await expect(editor).toContainText("unsaved draft paragraph 1");
  await page.getByTestId("edit").getByRole("button", { name: "跳转到正文", exact: true }).click();
  await expect(page.locator('[data-chapter-navigation-highlight="true"]')).toHaveText(
    "paragraph 25",
  );
  await page.getByRole("button", { name: "Chapter A", exact: true }).click();
  await expect(editor).toContainText("unsaved draft paragraph 1");
  await page.evaluate(() =>
    (window as any).assistantRegistration.onStateChange({
      agentStatus: "running",
      isAgentRunning: true,
    }),
  );
  await expect(editor).toHaveAttribute("contenteditable", "false");
  await page.getByTestId("edit").getByRole("button", { name: "跳转到正文", exact: true }).click();
  await expect(page.locator('[data-chapter-navigation-highlight="true"]')).toHaveText(
    "paragraph 25",
  );
  await expect(editor).toHaveAttribute("contenteditable", "false");
});

test("unavailable and foreign chapters never open tabs", async ({ page }) => {
  await page
    .getByTestId("missing")
    .getByRole("button", { name: "跳转到正文", exact: true })
    .click();
  await expect(page.getByText("无法打开章节，章节可能已删除或暂时无法加载")).toBeVisible();
  await page.getByTestId("other").getByRole("button", { name: "跳转到正文", exact: true }).click();
  expect(await page.evaluate(() => (window as any).tabsStore.getState().activeTabId)).toBe(
    "chapter:a",
  );
});

test("mobile edit navigation reveals editor without focusing its body", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(harness);
  await expect(page.locator(".ProseMirror")).toBeVisible();
  await page.getByTestId("edit").getByRole("button", { name: "跳转到正文", exact: true }).click();
  await expect(page.locator('[data-chapter-navigation-highlight="true"]')).toHaveText(
    "paragraph 25",
  );
  expect(await page.evaluate(() => (window as any).assistantClosed)).toBe(true);
  expect(await page.locator(".ProseMirror").evaluate((el) => el === document.activeElement)).toBe(
    false,
  );
  await page.screenshot({ path: "test-results/chapter-navigation-mobile.png" });
});

test("read and create chapter results do not offer navigation", async ({ page }) => {
  for (const id of ["read", "create"]) {
    await expect(page.getByTestId(id).getByRole("button", { name: /跳转到正文/ })).toHaveCount(0);
    await expect(
      page.getByTestId(id).locator('.agent-chapter-diff-line[role="button"]'),
    ).toHaveCount(0);
  }
});

test("a chapter disappearing after preflight does not leave a broken editor tab", async ({
  page,
}) => {
  let reads = 0;
  await page.route("**/api/v1/chapters/b", (route) => {
    reads += 1;
    if (reads === 1) return route.fallback();
    return route.fulfill({ status: 404, json: { detail: "Not found" } });
  });
  await page.getByTestId("edit").getByRole("button", { name: "跳转到正文", exact: true }).click();
  await expect(page.getByText("无法打开章节，章节可能已删除或暂时无法加载")).toBeVisible({
    timeout: 3000,
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).tabsStore.getState().activeTabId))
    .toBe("chapter:a");
});
