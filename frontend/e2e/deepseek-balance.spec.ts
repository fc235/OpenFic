import { test, expect } from "@playwright/test";

test("official balance refreshes after a round and is hidden for other providers", async ({ page }) => {
  let requests = 0;
  let fail = false;
  await page.route("**/api/v1/models*", route => route.fulfill({json:[
    {id:"official",model_id:"deepseek-chat",provider_id:"ds",task_type:"llm"},
    {id:"other",model_id:"deepseek-chat",provider_id:"proxy",task_type:"llm"},
  ]}));
  await page.route("**/api/v1/model-providers*", route => route.fulfill({json:[
    {id:"ds",name:"DeepSeek",url:"https://api.deepseek.com/v1",provider_type:"deepseek",updated_at:"2026-09-11"},
    {id:"proxy",name:"Proxy",url:"https://api.deepseek.com.example.org",provider_type:"deepseek",updated_at:"2026-09-11"},
  ]}));
  await page.route("**/api/v1/model-providers/ds/balance", route => {
    requests++;
    return route.fulfill(fail ? {status:502,json:{detail:"unavailable"}} : {json:{is_available:true,balance_infos:[
      {currency:"CNY",total_balance:requests===1?"12.3456":"11.2345",granted_balance:"0",topped_up_balance:"11.2345"},
    ]}});
  });
  await page.goto("http://127.0.0.1:5175/e2e/deepseek-balance-harness.html");
  await expect(page.getByText("余额 ¥12.3456")).toBeVisible();
  await page.evaluate(() => (window as unknown as {setBalanceRunning:(v:boolean)=>void}).setBalanceRunning(true));
  await page.evaluate(() => (window as unknown as {setBalanceRunning:(v:boolean)=>void}).setBalanceRunning(false));
  await expect(page.getByText("余额 ¥11.2345")).toBeVisible();
  fail = true;
  await page.getByRole("button",{name:"刷新 DeepSeek 余额"}).click();
  await expect(page.getByText("余额 —")).toBeVisible();
  await page.evaluate(() => (window as unknown as {changeBalanceModel:(v:string)=>void}).changeBalanceModel("other"));
  await expect(page.getByRole("button",{name:"刷新 DeepSeek 余额"})).toHaveCount(0);
});
