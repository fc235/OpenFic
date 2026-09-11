import { test, expect } from "@playwright/test";

test("character saves changes made during an outstanding save", async ({ page }) => {
  await page.goto("http://127.0.0.1:5175/e2e/autosave-harness.html");
  const editor = page.locator('[contenteditable="true"]').first();
  await page.evaluate(() => { (window as any).hold = true; });
  await editor.fill("first draft");
  await expect.poll(() => page.evaluate(() => (window as any).saved.length)).toBe(1);
  await editor.fill("latest draft");
  await page.evaluate(() => { (window as any).hold = false; (window as any).releaseSave(); });
  await expect.poll(() => page.evaluate(() => (window as any).saved.at(-1)?.description)).toContain("latest draft");
});

test("switching characters immediately flushes pending content", async ({ page }) => {
  await page.goto("http://127.0.0.1:5175/e2e/autosave-harness.html");
  await page.locator('[contenteditable="true"]').first().fill("pending draft");
  await page.evaluate(() => (window as any).switchRecord());
  await expect.poll(() => page.evaluate(() => (window as any).saved.at(-1)?.description)).toContain("pending draft");
});

test("token worker returns encoded counts rather than length estimates", async ({ page }) => {
  await page.goto("http://127.0.0.1:5175/e2e/autosave-harness.html");
  const count = await page.evaluate(async () => {
    // @ts-expect-error Vite resolves this browser module URL.
    const { countTokensAsync } = await import("/src/lib/token-count-async.ts");
    return countTokensAsync("hello world");
  });
  expect(count).toBe(2);
});

test("world entry saves edits made during an outstanding save", async ({ page }) => {
  const saved: { content: string }[] = [];
  let release!: () => void;
  await page.route("**/api/v1/world-info-entries/a", async route => {
    const data = route.request().postDataJSON();
    saved.push(data);
    if (saved.length === 1) await new Promise<void>(resolve => { release = resolve; });
    await route.fulfill({json:{...data,id:"a",world_info_id:"w"}});
  });
  await page.goto("http://127.0.0.1:5175/e2e/autosave-harness.html?world");
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.fill("first draft");
  await expect.poll(() => saved.length).toBe(1);
  await editor.fill("latest draft");
  release();
  await expect.poll(() => saved.at(-1)?.content).toContain("latest draft");
});
