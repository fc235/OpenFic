import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/settings", (route) =>
    route.fulfill({
      json: {
        language: "zh-CN",
        theme: "light",
        ...(route.request().method() === "PUT" ? route.request().postDataJSON() : {}),
      },
    }),
  );
  await page.route("**/api/v1/settings/agent-session-lock", (route) =>
    route.fulfill({ json: { is_locked: false } }),
  );
  await page.route("**/api/v1/agent/tools", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/v1/settings/audit-details/storage", (route) =>
    route.fulfill({ json: { detail_records_count: 2, detail_bytes: 2048 } }),
  );
});

for (const mobile of [false, true]) {
  test(`General contains small settings groups (${mobile ? "mobile" : "desktop"})`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://127.0.0.1:5175/e2e/settings-overlay-harness.html");
    await page.getByRole("button", { name: "设置", exact: true }).click();
    for (const name of ["编辑器", "上下文", "高级"]) {
      await expect(page.getByRole("button", { name, exact: true })).toHaveCount(0);
    }
    if (mobile) await page.getByRole("button", { name: "通用", exact: true }).click();
    await expect(page.getByRole("switch")).toHaveCount(7);
    for (const name of ["编辑器", "上下文", "高级"]) {
      await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(1);
    }
    const toggle = page.getByRole("switch", { name: "压缩系统提示词", exact: true });
    const saved = page.waitForRequest(
      (request) => request.url().endsWith("/api/v1/settings") && request.method() === "PUT",
    );
    await toggle.click();
    expect((await saved).postDataJSON()).toEqual({ compress_system_prompts: true });
    await expect(toggle).toBeChecked();
    await page.getByRole("button", { name: "清空详情", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "取消", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await page.getByRole("switch", { name: "段落自动缩进", exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `test-results/settings-consolidation-${mobile ? "mobile" : "desktop"}.png`,
    });
  });
}

for (const category of ["editor", "context", "advanced"]) {
  test(`legacy ${category} route opens General`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:5175/e2e/settings-overlay-harness.html?category=${category}`);
    await page.getByRole("button", { name: "设置", exact: true }).click();
    await expect(page.locator(".settings-sidebar-item--active")).toHaveText("通用");
    await expect(page.getByRole("switch")).toHaveCount(7);
  });
}
