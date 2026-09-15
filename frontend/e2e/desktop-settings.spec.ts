import { test, expect } from "@playwright/test";

const harness = "http://127.0.0.1:5175/e2e/desktop-settings-harness.html";

test("desktop preferences save, show pending state and poll active network addresses", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(harness);
  await expect(page.getByRole("combobox")).toHaveText("每次询问");
  await expect(page.getByRole("switch")).not.toBeChecked();
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "仅退出前端", exact: true }).click();
  await expect(page.getByRole("combobox")).toHaveText("仅退出前端");
  await page.getByRole("switch").click();
  await expect(page.getByRole("switch")).toBeChecked();
  await page.evaluate(() => (window as any).updateDesktopState({ lanPending: true }));
  await expect(page.getByText(/网络设置等待生效/)).toBeVisible();
  await page.evaluate(() =>
    (window as any).updateDesktopState({
      lanPending: false,
      addresses: [{ name: "Wi-Fi", url: "http://192.168.1.20:8000" }],
    }),
  );
  await expect(page.getByText("Wi-Fi", { exact: true })).toBeVisible();
  await expect(page.locator("svg title")).toHaveText("在其他设备上打开 Wi-Fi");
  await page.getByRole("button", { name: "复制地址" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("http://192.168.1.20:8000");
  expect(await page.evaluate(() => (window as any).desktopPatches)).toEqual([
    { closeBehavior: "frontend" },
    { lanEnabled: true },
  ]);
  await page.evaluate(() =>
    (window as any).updateDesktopState({ backendRunning: false, addresses: [] }),
  );
  await expect(page.getByText("后端已停止")).toBeVisible();
  await expect(page.getByText("Wi-Fi", { exact: true })).toHaveCount(0);
});

test("failed saving preserves saved value and displays an error", async ({ page }) => {
  await page.goto(harness);
  await expect(page.getByRole("switch")).toBeEnabled();
  await page.evaluate(() => {
    (window as any).failDesktopSave = true;
  });
  await page.getByRole("switch").click();
  await expect(page.getByRole("alert")).toContainText("Save unavailable");
  await expect(page.getByRole("switch")).not.toBeChecked();
  await expect(page.getByRole("switch")).toBeEnabled();
});

test("web hides desktop controls and remote instance disables LAN control", async ({ page }) => {
  await page.goto(harness + "?web");
  await expect(page.getByRole("region")).toHaveCount(0);
  await page.goto(harness + "?remote");
  await expect(page.getByRole("switch")).toBeDisabled();
  await expect(page.getByText("远程实例的局域网访问由远程主机管理。")).toBeVisible();
  await expect(page.getByRole("combobox")).toBeEnabled();
});

test("polling failures and asynchronous restart failures are visible without hiding state", async ({
  page,
}) => {
  await page.goto(harness);
  await expect(page.getByRole("combobox")).toBeEnabled();
  await page.evaluate(() => (window as any).updateDesktopState({ error: "Restart unavailable" }));
  await expect(page.getByRole("alert")).toContainText("Restart unavailable");
  await expect(page.getByText("后端正在运行")).toBeVisible();
  await page.evaluate(() => {
    (window as any).updateDesktopState({ error: undefined });
    (window as any).failDesktopPoll = true;
  });
  await expect(page.getByRole("alert")).toContainText("Poll unavailable");
  await expect(page.getByRole("combobox")).toHaveText("每次询问");
});
