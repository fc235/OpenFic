import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function mockOfficialBalance(page: Page) {
  await page.route("**/api/v1/models*", (route) =>
    route.fulfill({
      json: [{ id: "official", model_id: "deepseek-flash", provider_id: "ds", task_type: "llm" }],
    }),
  );
  await page.route("**/api/v1/model-providers*", (route) =>
    route.fulfill({
      json: [
        {
          id: "ds",
          name: "DeepSeek",
          url: "https://api.deepseek.com/v1",
          provider_type: "deepseek",
          updated_at: "2026-09-15",
        },
      ],
    }),
  );
  await page.route("**/api/v1/model-providers/ds/balance", (route) =>
    route.fulfill({
      json: {
        is_available: true,
        balance_infos: [
          {
            currency: "CNY",
            total_balance: "12.34",
            granted_balance: "0",
            topped_up_balance: "12.34",
          },
        ],
      },
    }),
  );
}

test("balance tooltip uses Beijing weekday pricing independently of device timezone", async ({
  browser,
}) => {
  const context = await browser.newContext({ timezoneId: "America/Los_Angeles" });
  const page = await context.newPage();
  try {
    await mockOfficialBalance(page);
    await page.goto("http://127.0.0.1:5175/e2e/deepseek-balance-harness.html");
    await expect(page.getByText("余额 ¥12.34")).toBeVisible();
    for (const [time, label] of [
      ["2026-09-14T00:59:59Z", "梁文谷"],
      ["2026-09-14T01:00:00Z", "梁文峰"],
      ["2026-09-14T03:59:59Z", "梁文峰"],
      ["2026-09-14T04:00:00Z", "梁文谷"],
      ["2026-09-14T05:59:59Z", "梁文谷"],
      ["2026-09-14T06:00:00Z", "梁文峰"],
      ["2026-09-14T09:59:59Z", "梁文峰"],
      ["2026-09-14T10:00:00Z", "梁文谷"],
      ["2026-09-18T01:00:00Z", "梁文峰"],
      ["2026-09-19T01:00:00Z", "梁文谷"],
      ["2026-09-20T06:00:00Z", "梁文谷"],
    ]) {
      await page.clock.setFixedTime(new Date(time));
      await page.getByRole("button", { name: "刷新 DeepSeek 余额" }).hover();
      await expect(page.getByRole("tooltip")).toContainText(label, { timeout: 3000 });
      await expect(page.getByRole("tooltip")).toContainText("北京时间");
      await page.mouse.move(500, 500, { steps: 10 });
      await expect(page.getByRole("tooltip")).not.toBeVisible();
    }
  } finally {
    await context.close();
  }
});

test("an open balance tooltip updates when a pricing boundary is crossed", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-14T00:59:50Z") });
  await mockOfficialBalance(page);
  await page.goto("http://127.0.0.1:5175/e2e/deepseek-balance-harness.html");
  await expect(page.getByText("余额 ¥12.34")).toBeVisible();
  await page.clock.pauseAt(new Date("2026-09-14T00:59:58Z"));
  await page.getByRole("button", { name: "刷新 DeepSeek 余额" }).hover();
  await page.clock.runFor(800);
  await expect(page.getByRole("tooltip")).toContainText("梁文谷", { timeout: 3000 });
  await page.clock.runFor(1200);
  await expect(page.getByRole("tooltip")).toContainText("梁文峰", { timeout: 3000 });
});

test("pricing quips vary on each hover and remain stable through balance updates", async ({
  page,
}) => {
  await mockOfficialBalance(page);
  await page.goto("http://127.0.0.1:5175/e2e/deepseek-balance-harness.html");
  await expect(page.getByText("余额 ¥12.34")).toBeVisible();
  await page.clock.setFixedTime(new Date("2026-09-14T02:00:00Z"));
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  const button = page.getByRole("button", { name: "刷新 DeepSeek 余额" });
  await button.hover();
  await expect(page.getByRole("tooltip")).toContainText("当前为梁文峰哦，你的钱包真是肥嘟嘟的");
  const original = await page.getByRole("tooltip").innerText();
  await page.evaluate(() => {
    Math.random = () => 0.99;
    (window as any).setBalanceRunning(true);
  });
  await page.evaluate(() => (window as any).setBalanceRunning(false));
  await expect(page.getByRole("tooltip")).toHaveText(original, { useInnerText: true });
  await page.mouse.move(500, 500, { steps: 10 });
  await expect(page.getByRole("tooltip")).not.toBeVisible();
  await button.hover();
  await expect(page.getByRole("tooltip")).toContainText("梁文峰正在值班，大肥鱼先悠着点蹬哦！");
  const peakTexts = new Set<string>();
  const valleyTexts = new Set<string>();
  for (const [time, label, texts] of [
    ["2026-09-14T02:00:00Z", "梁文峰", peakTexts],
    ["2026-09-14T04:00:00Z", "梁文谷", valleyTexts],
  ] as const) {
    await page.clock.setFixedTime(new Date(time));
    for (let variant = 0; variant < 5; variant++) {
      await page.mouse.move(500, 500, { steps: 10 });
      await expect(page.getByRole("tooltip")).not.toBeVisible();
      await page.evaluate((index) => {
        Math.random = () => (index + 0.1) / 5;
      }, variant);
      await button.hover();
      await expect(page.getByRole("tooltip")).toContainText(label);
      texts.add(await page.getByRole("tooltip").innerText());
    }
  }
  expect(peakTexts.size).toBe(5);
  expect(valleyTexts.size).toBe(5);
});

test("official balance refreshes after a round and is hidden for other providers", async ({
  page,
}) => {
  let requests = 0;
  let fail = false;
  await page.route("**/api/v1/models*", (route) =>
    route.fulfill({
      json: [
        { id: "official", model_id: "deepseek-chat", provider_id: "ds", task_type: "llm" },
        { id: "other", model_id: "deepseek-chat", provider_id: "proxy", task_type: "llm" },
      ],
    }),
  );
  await page.route("**/api/v1/model-providers*", (route) =>
    route.fulfill({
      json: [
        {
          id: "ds",
          name: "DeepSeek",
          url: "https://api.deepseek.com/v1",
          provider_type: "deepseek",
          updated_at: "2026-09-11",
        },
        {
          id: "proxy",
          name: "Proxy",
          url: "https://api.deepseek.com.example.org",
          provider_type: "deepseek",
          updated_at: "2026-09-11",
        },
      ],
    }),
  );
  await page.route("**/api/v1/model-providers/ds/balance", (route) => {
    requests++;
    return route.fulfill(
      fail
        ? { status: 502, json: { detail: "unavailable" } }
        : {
            json: {
              is_available: true,
              balance_infos: [
                {
                  currency: "CNY",
                  total_balance: requests === 1 ? "12.3456" : "11.2345",
                  granted_balance: "0",
                  topped_up_balance: "11.2345",
                },
              ],
            },
          },
    );
  });
  await page.goto("http://127.0.0.1:5175/e2e/deepseek-balance-harness.html");
  await expect(page.getByText("余额 ¥12.3456")).toBeVisible();
  await page.evaluate(() =>
    (window as unknown as { setBalanceRunning: (v: boolean) => void }).setBalanceRunning(true),
  );
  await page.evaluate(() =>
    (window as unknown as { setBalanceRunning: (v: boolean) => void }).setBalanceRunning(false),
  );
  await expect(page.getByText("余额 ¥11.2345")).toBeVisible();
  fail = true;
  await page.getByRole("button", { name: "刷新 DeepSeek 余额" }).click();
  await expect(page.getByText("余额 —")).toBeVisible();
  await page.evaluate(() =>
    (window as unknown as { changeBalanceModel: (v: string) => void }).changeBalanceModel("other"),
  );
  await expect(page.getByRole("button", { name: "刷新 DeepSeek 余额" })).toHaveCount(0);
});
