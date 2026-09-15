import { test, expect, type Page } from "@playwright/test";
const harness = "http://127.0.0.1:5175/e2e/model-click-harness.html";
const row = (page: Page, id: string) =>
  page.getByRole("dialog").getByRole("button", { name: `模型${id}`, exact: true });
async function open(page: Page, query = "") {
  await page.goto(harness + query);
  await page.getByRole("button", { name: "模型a", exact: true }).click();
  await expect(row(page, "b")).toBeVisible();
}
async function freeze(page: Page) {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
}

test("single selection waits 250 ms and closes; ordinary selectors stay immediate", async ({
  page,
}) => {
  await open(page);
  await freeze(page);
  await row(page, "b").click();
  await page.clock.runFor(249);
  await expect(page.locator("#current")).toHaveText("a");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.clock.runFor(1);
  await expect(page.locator("#current")).toHaveText("b");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).defaults)).toEqual([]);
  await page.clock.resume();
  await open(page, "?immediate");
  await freeze(page);
  await row(page, "b").click();
  await expect(page.locator("#current")).toHaveText("b");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("native double click updates only the default, including the 250 ms boundary", async ({
  page,
}) => {
  await open(page);
  await row(page, "b").dblclick();
  await expect(page.locator("#current")).toHaveText("a");
  expect(await page.evaluate(() => (window as any).defaults)).toEqual(["b"]);
  await expect(page.getByRole("dialog")).toBeVisible();
  await freeze(page);
  await row(page, "c").click();
  await page.clock.runFor(240);
  const box = (await row(page, "c").boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + box.height / 2);
  await page.mouse.down({ clickCount: 2 });
  await page.clock.runFor(40);
  await page.mouse.up({ clickCount: 2 });
  await page.clock.runFor(500);
  expect(await page.evaluate(() => (window as any).defaults)).toEqual(["b", "c"]);
  expect(await page.evaluate(() => (window as any).selections)).toEqual([]);
  await expect(page.locator("#current")).toHaveText("a");
});

test("fast clicks on different rows select only the last row", async ({ page }) => {
  await open(page);
  await freeze(page);
  await row(page, "b").click();
  await page.clock.runFor(100);
  await row(page, "c").click();
  await page.clock.runFor(250);
  expect(await page.evaluate(() => (window as any).selections)).toEqual(["c"]);
  expect(await page.evaluate(() => (window as any).defaults)).toEqual([]);
});

for (const reason of [
  "outside",
  "escape",
  "disabled",
  "loading",
  "removed",
  "changed",
  "unmount",
]) {
  test(`pending click is cancelled on ${reason}`, async ({ page }) => {
    await open(page);
    await freeze(page);
    await row(page, "b").click();
    if (reason === "outside") await page.locator("#outside").click();
    else if (reason === "escape") await page.keyboard.press("Escape");
    else
      await page.evaluate((reason) => {
        const w = window as any;
        if (reason === "disabled") w.setDisabled(true);
        if (reason === "loading") w.setLoading(true);
        if (reason === "removed") w.removeModel();
        if (reason === "changed") w.changeModel("c");
        if (reason === "unmount") w.unmountModel();
      }, reason);
    await page.clock.runFor(500);
    expect(await page.evaluate(() => (window as any).selections)).toEqual([]);
    expect(await page.evaluate(() => (window as any).defaults)).toEqual([]);
  });
}

for (const key of ["Enter", "Space"]) {
  test(`keyboard ${key} selects immediately without setting default`, async ({ page }) => {
    await open(page);
    await freeze(page);
    await row(page, "b").focus();
    await page.keyboard.press(key);
    await expect(page.locator("#current")).toHaveText("b");
    expect(await page.evaluate(() => (window as any).defaults)).toEqual([]);
  });
}

test("already-default and pending-save double clicks do not write or switch", async ({ page }) => {
  await open(page);
  await row(page, "a").dblclick();
  expect(await page.evaluate(() => (window as any).defaults)).toEqual([]);
  await page.evaluate(() => {
    (window as any).holdSave = true;
  });
  await row(page, "b").dblclick();
  await row(page, "c").dblclick();
  expect(await page.evaluate(() => (window as any).defaults)).toEqual(["b"]);
  expect(await page.evaluate(() => (window as any).selections)).toEqual([]);
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("touch users can still select models without a redundant default button", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await open(page, "?many");
  await row(page, "b").tap();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "模型b", exact: true }).tap();
  await expect(page.getByText("单击切换当前模型，双击设为默认模型", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "设为默认模型", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "已是默认模型", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).defaults)).toEqual([]);
  await context.close();
});
