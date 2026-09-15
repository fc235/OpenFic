import { expect, test } from "@playwright/test";

test("upstream custom theme preview and save coexist with local desktop controls", async ({
  page,
}) => {
  let settings: Record<string, any> = {
    theme: "light",
    font_family: "system-ui",
    code_font_family: "ui-monospace",
  };
  const writes: Record<string, any>[] = [];
  await page.route("**/api/v1/settings/**", (route) =>
    route.fulfill({ json: { is_locked: false } }),
  );
  await page.route("**/api/v1/agent/tools", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/v1/settings", async (route) => {
    if (route.request().method() === "PUT") {
      const data = route.request().postDataJSON();
      writes.push(data);
      settings = { ...settings, ...data };
    }
    await route.fulfill({ json: settings });
  });
  await page.goto("http://127.0.0.1:5175/e2e/upstream-theme-harness.html");
  const accent = page
    .locator('[data-theme-appearance="light"]')
    .getByRole("textbox", { name: "强调色", exact: true });
  await expect(accent).toBeVisible();
  const variable = () =>
    page.evaluate(() =>
      getComputedStyle(document.querySelector(".radix-themes")!).getPropertyValue("--accent-9"),
    );
  const initial = await variable();
  await accent.fill("#3366ff");
  await expect.poll(variable).not.toBe(initial);
  expect(writes).toHaveLength(0);
  await accent.press("Tab");
  await expect.poll(() => settings.theme_config?.light.accent).toBe("#3366ff");
  expect(settings.light_theme_preset).toBe("custom");
  expect(settings.theme_config.dark.accent).not.toBe("#3366ff");
  const savedColor = await variable();
  await accent.fill("#ee2244");
  await expect.poll(variable).not.toBe(savedColor);
  await accent.press("Escape");
  await expect.poll(variable).toBe(savedColor);
  expect(settings.theme_config.light.accent).toBe("#3366ff");
  await page.reload();
  await expect(accent).toHaveValue("#3366ff");
  await page.getByRole("button", { name: "通用", exact: true }).click();
  await expect(page.getByRole("region")).toContainText("关闭窗口时");
  await expect(page.getByText("快捷新会话", { exact: true })).toHaveCount(0);
});
