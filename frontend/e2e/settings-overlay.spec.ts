import { expect, test } from "@playwright/test";

test("closing settings removes its overlay before project navigation", async ({ page }) => {
  await page.route("**/api/v1/settings", (route) =>
    route.fulfill({ json: { language: "zh-CN", theme: "light" } }),
  );
  await page.route("**/api/v1/settings/agent-session-lock", (route) =>
    route.fulfill({ json: { is_locked: false } }),
  );
  await page.route("**/api/v1/agent/tools", (route) => route.fulfill({ json: [] }));
  await page.goto("http://127.0.0.1:5175/e2e/settings-overlay-harness.html");
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.locator(".rt-DialogOverlay")).toHaveCount(0);
  const projectLink = page.getByRole("link", { name: "遮罩回归项目", exact: true });
  const box = (await projectLink.boundingBox())!;
  const point = { x: Math.max(20, box.x + 20), y: Math.max(20, box.y + 20) };
  const hit = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href"),
    point,
  );
  expect(hit).toBe("/projects/probe");
  await page.mouse.click(point.x, point.y);
  await expect(page.getByText("项目已打开")).toBeVisible();
});
