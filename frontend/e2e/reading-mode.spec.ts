import { expect, test, type Page } from "@playwright/test";

const harness = "/e2e/reading-mode-harness.html";
const longContent = (id: string) =>
  Array.from(
    { length: 85 },
    (_, index) => `${id} 第${index + 1}行：月光照着山谷，旅人沿着河流前行，远方的灯火渐渐明亮。`,
  ).join("\n");
type FixtureOptions = {
  a?: string;
  b?: string;
  failB?: boolean;
  delayB?: number;
  single?: boolean;
};

async function setup(page: Page, options: FixtureOptions = {}) {
  await page.route("**/api/v1/settings", (route) => route.fulfill({ json: {} }));
  await page.route("**/api/v1/chapters/*", async (route) => {
    const id = route.request().url().split("/").at(-1)!;
    if (id === "b" && options.delayB)
      await new Promise((resolve) => setTimeout(resolve, options.delayB));
    if (id === "b" && options.failB) {
      await route.fulfill({ status: 500, json: { detail: "chapter unavailable" } });
      return;
    }
    const content = options[id as "a" | "b"] ?? longContent(id);
    await route.fulfill({
      json: {
        id,
        project_id: "p",
        volume_id: `volume-${id}`,
        title: `章节${id.toUpperCase()}`,
        content,
        word_count: content.length,
        order: id === "a" ? 0 : 1,
        created_at: "2026-10-25T00:00:00Z",
        updated_at: "2026-10-25T00:00:00Z",
        ...(route.request().method() === "PATCH" ? route.request().postDataJSON() : {}),
      },
    });
  });
  await page.goto(options.single ? `${harness}?single` : harness);
  await expect(page.locator('[contenteditable="true"]').first()).toBeVisible();
}

async function openReader(page: Page) {
  await page.getByRole("button", { name: "阅读模式", exact: true }).click();
  await expect(page.getByTestId("reading-viewport")).toBeVisible();
  await expect(page.getByRole("heading", { name: "章节A", exact: true })).toBeVisible();
}

const next = (page: Page) => page.getByRole("button", { name: "下一页", exact: true });
const previous = (page: Page) => page.getByRole("button", { name: "上一页", exact: true });
const play = (page: Page) => page.getByRole("button", { name: "开始自动翻页", exact: true });
const pause = (page: Page) => page.getByRole("button", { name: "暂停自动翻页", exact: true });
const scrollTop = (page: Page) =>
  page.getByTestId("reading-viewport").evaluate((el) => el.scrollTop);

async function intervalOne(page: Page) {
  await page.getByRole("button", { name: "阅读设置", exact: true }).click();
  await page.getByLabel("自动翻页间隔（秒）", { exact: true }).fill("1");
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("自动翻页间隔（秒）", { exact: true })).not.toBeVisible();
}

type NativeReadingTestWindow = Window & {
  OpenFicReading: { postMessage(message: string): void };
  readingHostMessages: { enabled: boolean }[];
  readingTestFocused: boolean;
};

async function installReadingHost(page: Page) {
  await page.addInitScript(() => {
    const host = window as unknown as NativeReadingTestWindow;
    host.readingHostMessages = [];
    host.readingTestFocused = true;
    Object.defineProperty(document, "hasFocus", {
      configurable: true,
      value: () => host.readingTestFocused,
    });
    host.OpenFicReading = {
      postMessage: (message) => host.readingHostMessages.push(JSON.parse(message)),
    };
  });
}

const hostEnabled = (page: Page) =>
  page.evaluate(
    () => (window as unknown as NativeReadingTestWindow).readingHostMessages.at(-1)?.enabled,
  );

async function volumeEvent(page: Page, direction: unknown) {
  await page.evaluate((value) => {
    window.dispatchEvent(
      new CustomEvent("openfic:reading-volume-key", { detail: { direction: value } }),
    );
  }, direction);
}

async function readingFocus(page: Page, focused: boolean) {
  await page.evaluate((value) => {
    (window as unknown as NativeReadingTestWindow).readingTestFocused = value;
    window.dispatchEvent(new Event(value ? "focus" : "blur"));
  }, focused);
}

async function readingVisibility(page: Page, visible: boolean) {
  await page.evaluate((value) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: value ? "visible" : "hidden",
    });
    Object.defineProperty(document, "hidden", { configurable: true, value: !value });
    document.dispatchEvent(new Event("visibilitychange"));
  }, visible);
}

test("native volume paging bypasses custom shortcuts and pauses automatic reading", async ({
  page,
}) => {
  await installReadingHost(page);
  await setup(page);
  expect(await hostEnabled(page)).not.toBe(true);
  await openReader(page);
  await expect.poll(() => hostEnabled(page)).toBe(true);
  await page.getByRole("button", { name: "阅读设置", exact: true }).click();
  await page.getByLabel("上一页按键", { exact: true }).press("k");
  await page.getByLabel("下一页按键", { exact: true }).press("j");
  await page.keyboard.press("Escape");
  await expect.poll(() => hostEnabled(page)).toBe(true);
  await play(page).click();
  await expect(pause(page)).toBeVisible();
  await volumeEvent(page, "next");
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  await expect(play(page)).toBeVisible();
  await volumeEvent(page, "previous");
  await expect.poll(() => scrollTop(page)).toBe(0);
});

test("native capture disables in settings and on exit and does not duplicate after reopen", async ({
  page,
}) => {
  await installReadingHost(page);
  await setup(page);
  await openReader(page);
  await expect.poll(() => hostEnabled(page)).toBe(true);
  await volumeEvent(page, "next");
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  const onePage = await scrollTop(page);
  await page.getByRole("button", { name: "阅读设置", exact: true }).click();
  await expect.poll(() => hostEnabled(page)).toBe(false);
  await volumeEvent(page, "next");
  expect(await scrollTop(page)).toBe(onePage);
  await page.keyboard.press("Escape");
  await expect.poll(() => hostEnabled(page)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("reading-viewport")).toHaveCount(0);
  await expect.poll(() => hostEnabled(page)).toBe(false);
  await volumeEvent(page, "next");
  await openReader(page);
  await expect.poll(() => hostEnabled(page)).toBe(true);
  expect(await scrollTop(page)).toBe(0);
  await volumeEvent(page, "next");
  await expect.poll(() => scrollTop(page)).toBe(onePage);
});

test("native capture gates blur and hidden state then resynchronizes on resume", async ({
  page,
}) => {
  await installReadingHost(page);
  await setup(page);
  await openReader(page);
  await expect.poll(() => hostEnabled(page)).toBe(true);
  for (const signal of ["blur", "hidden"] as const) {
    if (signal === "blur") await readingFocus(page, false);
    else await readingVisibility(page, false);
    await expect.poll(() => hostEnabled(page)).toBe(false);
    await volumeEvent(page, "next");
    expect(await scrollTop(page)).toBe(0);
    // A native resume cannot override a still-inactive document.
    await page.evaluate(() => window.dispatchEvent(new Event("openfic:reading-native-resume")));
    await expect.poll(() => hostEnabled(page)).toBe(false);
    if (signal === "blur") await readingFocus(page, true);
    else await readingVisibility(page, true);
    await expect.poll(() => hostEnabled(page)).toBe(true);
  }
  const beforeResume = await page.evaluate(
    () => (window as unknown as NativeReadingTestWindow).readingHostMessages.length,
  );
  await page.evaluate(() => window.dispatchEvent(new Event("openfic:reading-native-resume")));
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as NativeReadingTestWindow).readingHostMessages.length,
      ),
    )
    .toBeGreaterThan(beforeResume);
  expect(await hostEnabled(page)).toBe(true);
  await volumeEvent(page, "next");
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
});

test("native capture is suspended while a chapter loads and returns for its first page", async ({
  page,
}) => {
  await installReadingHost(page);
  await setup(page, { a: "短章节", delayB: 1600 });
  await openReader(page);
  await expect.poll(() => hostEnabled(page)).toBe(true);
  await volumeEvent(page, "next");
  await expect(page.locator('.reading-mode-body[aria-busy="true"]')).toBeVisible();
  await expect.poll(() => hostEnabled(page)).toBe(false);
  await volumeEvent(page, "next");
  await expect(page.getByRole("heading", { name: "章节B", exact: true })).toBeVisible();
  await expect.poll(() => hostEnabled(page)).toBe(true);
  expect(await scrollTop(page)).toBe(0);
  await volumeEvent(page, "next");
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
});

test("native volume events reject malformed directions without interrupting playback", async ({
  page,
}) => {
  await installReadingHost(page);
  await setup(page);
  await openReader(page);
  await expect.poll(() => hostEnabled(page)).toBe(true);
  await play(page).click();
  for (const direction of ["up", "Next", null, 1, {}]) await volumeEvent(page, direction);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("openfic:reading-volume-key"));
    window.dispatchEvent(new CustomEvent("openfic:reading-volume-key", { detail: null }));
  });
  expect(await scrollTop(page)).toBe(0);
  await expect(pause(page)).toBeVisible();
});

test("ordinary browser without a native bridge ignores volume events and volume keyboard keys", async ({
  page,
}) => {
  await setup(page);
  await openReader(page);
  await volumeEvent(page, "next");
  const prevented = await page.getByTestId("reading-viewport").evaluate((element) =>
    ["AudioVolumeUp", "AudioVolumeDown"].map((key) => {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      element.dispatchEvent(event);
      return event.defaultPrevented;
    }),
  );
  expect(prevented).toEqual([false, false]);
  expect(await scrollTop(page)).toBe(0);
});

test("reader receives the live unsaved draft and exit restores the same editing surface", async ({
  page,
}) => {
  await setup(page);
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.fill("尚未保存的现场草稿\n第二行仍在");
  await openReader(page);
  await expect(page.getByTestId("reading-content")).toContainText("尚未保存的现场草稿");
  await expect(page.getByTestId("reading-content").locator('[contenteditable="true"]')).toHaveCount(
    0,
  );
  await next(page).click();
  await expect(page.getByRole("heading", { name: "章节B", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "退出阅读模式", exact: true }).click();
  await expect(editor).toBeVisible();
  await expect(editor).toContainText("尚未保存的现场草稿");
  await editor.press("End");
  await editor.press("ArrowLeft");
  await page.keyboard.insertText("继续编辑");
  await expect(editor).toContainText("继续编辑");
});

test("closing the reader restores focus to the original editing surface", async ({ page }) => {
  await setup(page);
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.focus();
  await expect(editor).toBeFocused();
  await editor.evaluate((el) => el.setAttribute("data-original-focused-editor", "true"));
  await openReader(page);
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-original-focused-editor="true"]')).toBeFocused();
});

test("arrows page within measured chapter before crossing and previous chapter opens at its last page", async ({
  page,
}) => {
  await setup(page);
  await openReader(page);
  await page.screenshot({ path: "../tmp/reading-mode/desktop.png", animations: "disabled" });
  await page.getByTestId("reading-content").click();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "章节A", exact: true })).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => scrollTop(page)).toBe(0);
  for (
    let turns = 0;
    turns < 40 && !(await page.getByRole("heading", { name: "章节B", exact: true }).count());
    turns++
  ) {
    await next(page).click();
    await expect(next(page)).toBeEnabled();
  }
  await expect(page.getByRole("heading", { name: "章节B", exact: true })).toBeVisible();
  await expect.poll(() => scrollTop(page)).toBe(0);
  await previous(page).click();
  await expect(page.getByRole("heading", { name: "章节A", exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByTestId("reading-viewport")
        .evaluate((el) => Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop)),
    )
    .toBeLessThan(2);
  await expect(page.getByTestId("reading-progress")).not.toHaveText("");
});

test("one second automatic paging stops at final chapter and stays stopped on reopen", async ({
  page,
}) => {
  await setup(page, { a: "第一章短文", b: "最终章短文" });
  await openReader(page);
  await intervalOne(page);
  await play(page).click();
  await expect(page.getByRole("heading", { name: "章节B", exact: true })).toBeVisible();
  await expect(play(page)).toBeVisible();
  await expect(next(page)).toBeDisabled();
  await page.keyboard.press("Escape");
  await openReader(page);
  await expect(play(page)).toBeVisible();
  await page.waitForTimeout(1200);
  await expect(page.getByRole("heading", { name: "章节A", exact: true })).toBeVisible();
});

test("one long chapter measures initial pages and stays pageable after resizing", async ({
  page,
}) => {
  await setup(page, { single: true });
  await openReader(page);
  await expect(next(page)).toBeEnabled();
  await expect(play(page)).toBeEnabled();
  await next(page).click();
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  await page.setViewportSize({ width: 1000, height: 500 });
  await expect(next(page)).toBeEnabled();
  await next(page).click();
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(500);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(next(page)).toBeEnabled();
  await expect(previous(page)).toBeEnabled();
});

test("automatic continuation from short chapter to long final chapter keeps paging", async ({
  page,
}) => {
  await setup(page, { a: "短小的第一章" });
  await openReader(page);
  await intervalOne(page);
  await play(page).click();
  await expect(page.getByRole("heading", { name: "章节B", exact: true })).toBeVisible();
  await expect(pause(page)).toBeVisible();
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  await expect(pause(page)).toBeVisible();
});

test("exiting during playback cancels the timer and preserves normal editor keys", async ({
  page,
}) => {
  let continuationRequests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/chapters/b")) continuationRequests++;
  });
  await setup(page, { a: "当前正在编辑", b: "下一章" });
  await openReader(page);
  await intervalOne(page);
  await play(page).click();
  await expect(pause(page)).toBeVisible();
  await page.getByRole("button", { name: "退出阅读模式", exact: true }).click();
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.click();
  await editor.press("End");
  await editor.press("ArrowLeft");
  await page.keyboard.insertText("仍可编辑");
  await expect(editor).toContainText("仍可编辑");
  await page.waitForTimeout(1200);
  expect(continuationRequests).toBe(0);
  await openReader(page);
  await expect(play(page)).toBeVisible();
  await expect(page.getByTestId("reading-content")).toContainText("仍可编辑");
});

test("settings pause playback, rebind keys without turning pages and persist across reopen", async ({
  page,
}) => {
  await setup(page);
  await openReader(page);
  await play(page).click();
  await expect(pause(page)).toBeVisible();
  await page.getByRole("button", { name: "阅读设置", exact: true }).click();
  await page.screenshot({
    path: "../tmp/reading-mode/desktop-settings.png",
    animations: "disabled",
  });
  const before = await scrollTop(page);
  const prevKey = page.getByLabel("上一页按键", { exact: true });
  const nextKey = page.getByLabel("下一页按键", { exact: true });
  await prevKey.focus();
  await prevKey.press("k");
  await nextKey.focus();
  await nextKey.press("j");
  await expect.poll(() => scrollTop(page)).toBe(before);
  const interval = page.getByLabel("自动翻页间隔（秒）", { exact: true });
  await interval.fill("3");
  await interval.press("ArrowUp");
  await expect.poll(() => scrollTop(page)).toBe(before);
  await page.keyboard.press("Escape");
  await expect(play(page)).toBeVisible();
  await page.getByTestId("reading-content").click();
  await page.keyboard.press("j");
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  await page.keyboard.press("k");
  await expect.poll(() => scrollTop(page)).toBe(0);
  await page.keyboard.press("Control+j");
  await expect.poll(() => scrollTop(page)).toBe(0);
  await page.keyboard.press("Escape");
  await openReader(page);
  await page.getByRole("button", { name: "阅读设置", exact: true }).click();
  await expect(prevKey).toHaveValue("k");
  await expect(nextKey).toHaveValue("j");
  await expect(interval).toHaveValue("4");
});

test("manual page buttons and shortcuts pause automatic reading", async ({ page }) => {
  await setup(page);
  await openReader(page);
  await play(page).click();
  await expect(pause(page)).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(play(page)).toBeVisible();
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  await play(page).click();
  await expect(pause(page)).toBeVisible();
  await previous(page).click();
  await expect(play(page)).toBeVisible();
  await expect.poll(() => scrollTop(page)).toBe(0);
});

for (const signal of ["blur", "hidden"] as const) {
  test(`${signal} pauses automatic paging and does not resume automatically`, async ({ page }) => {
    await setup(page);
    await openReader(page);
    await intervalOne(page);
    await play(page).click();
    await expect(pause(page)).toBeVisible();
    await page.evaluate((kind) => {
      if (kind === "blur") window.dispatchEvent(new Event("blur"));
      else {
        Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
        Object.defineProperty(document, "hidden", { configurable: true, value: true });
        document.dispatchEvent(new Event("visibilitychange"));
      }
    }, signal);
    await expect(play(page)).toBeVisible();
    const before = await scrollTop(page);
    await page.waitForTimeout(1200);
    expect(await scrollTop(page)).toBe(before);
  });
}

test("chapter loading failure pauses automatic paging and preserves the readable chapter", async ({
  page,
}) => {
  await setup(page, { a: "短章节", failB: true });
  await openReader(page);
  await intervalOne(page);
  await play(page).click();
  await expect(play(page)).toBeVisible();
  await expect(page.getByRole("heading", { name: "章节A", exact: true })).toBeVisible();
  await expect(page.getByTestId("reading-content")).toContainText("短章节");
});

test("continuation reads the other chapter's local working copy without changing the editor", async ({
  page,
}) => {
  await setup(page, { a: "编辑器原文", b: "服务器旧版" });
  await page.evaluate(async () => {
    const modulePath = "/src/lib/local-db.ts";
    const { saveWritingWorkingCopy } = await import(modulePath);
    await saveWritingWorkingCopy({
      entityId: "b",
      type: "chapter",
      title: "章节B",
      content: "本地未同步的下一章草稿",
      baseUpdatedAt: "2026-10-25T00:00:00Z",
      updatedAt: new Date("2026-10-25T01:00:00Z"),
    });
  });
  await openReader(page);
  await next(page).click();
  await expect(page.getByRole("heading", { name: "章节B", exact: true })).toBeVisible();
  await expect(page.getByTestId("reading-content")).toContainText("本地未同步的下一章草稿");
  await page.keyboard.press("Escape");
  await expect(page.locator('[contenteditable="true"]').first()).toHaveText("编辑器原文");
});

test("a delayed chapter fetch does not skip its first page or duplicate requests", async ({
  page,
}) => {
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/chapters/b")) requests++;
  });
  await setup(page, { a: "短章节", delayB: 1600 });
  await openReader(page);
  await intervalOne(page);
  await play(page).click();
  await expect(page.getByRole("heading", { name: "章节B", exact: true })).toBeVisible();
  expect(requests).toBe(1);
  expect(await scrollTop(page)).toBe(0);
});

for (const content of ["", "短章节只有一行。"]) {
  test(`mobile explicit buttons handle ${content ? "short" : "empty"} chapters and resize`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setup(page, { a: content, b: "最后一章" });
    await openReader(page);
    if (content) {
      await page.screenshot({ path: "../tmp/reading-mode/mobile.png", animations: "disabled" });
      await page.getByRole("button", { name: "阅读设置", exact: true }).click();
      await page.screenshot({
        path: "../tmp/reading-mode/mobile-settings.png",
        animations: "disabled",
      });
      await page.keyboard.press("Escape");
    }
    await expect(previous(page)).toBeDisabled();
    await expect(next(page)).toBeInViewport();
    await next(page).click();
    await expect(page.getByRole("heading", { name: "章节B", exact: true })).toBeVisible();
    await expect(next(page)).toBeDisabled();
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(previous(page)).toBeInViewport();
    await previous(page).click();
    await expect(page.getByRole("heading", { name: "章节A", exact: true })).toBeVisible();
    expect(await scrollTop(page)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
