import { test, expect } from "@playwright/test";

test("references save, preview read-only material, and unlink on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let sources: { id: string; title: string }[] = [];
  await page.route("**/api/v1/projects?**", route => route.fulfill({ json: {
    items: [{id:"a",title:"当前作品"},{id:"b",title:"共享世界观基础资料"}], total:2,
  } }));
  await page.route("**/api/v1/projects/a/references/characters", async route => {
    if (route.request().method() === "PUT") {
      sources = route.request().postDataJSON().source_project_ids.length ? [{id:"b",title:"共享世界观基础资料"}] : [];
    }
    await route.fulfill({ json:{sources, used_by:[]} });
  });
  let detailRequests = 0;
  await page.route("**/api/v1/projects/a/references/characters/b?*", route => {
    const detail = new URL(route.request().url()).searchParams.has("item_id");
    if (detail) detailRequests++;
    return route.fulfill({json:{items:[{id:"c",name:"林舟",...(detail ? {content:"共享出身设定"} : {})}]}});
  });
  await page.goto("http://127.0.0.1:5175/e2e/project-references-harness.html");
  await page.getByRole("button", { name:"共享资料", exact:true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name:"保存", exact:true }).click();
  await expect(page.getByText("引用 1 个项目 · 本地资料供 0 个项目引用")).toBeVisible();
  await page.getByRole("button", { name:"共享资料", exact:true }).click();
  await page.getByRole("button", { name:"查看资料" }).click();
  await expect(page.getByText("林舟", {exact:true})).toBeVisible();
  expect(detailRequests).toBe(0);
  await page.getByText("林舟", {exact:true}).click();
  await expect(page.getByText("共享出身设定")).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({path:testInfo.outputPath("shared-material-mobile.png")});
  await page.getByRole("checkbox").uncheck();
  await page.getByRole("button", { name:"保存", exact:true }).click();
  await expect(page.getByText("引用 0 个项目 · 本地资料供 0 个项目引用")).toBeVisible();
});
