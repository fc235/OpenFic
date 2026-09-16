import { test, expect } from "@playwright/test";

test("reference manuscript binds, previews live chapters read-only, and unlinks", async ({ page }, testInfo) => {
  let sources: { id: string; title: string }[] = [];
  let body = "第一段描写。\n第二段对白。\n末段收束。";
  let detailRequests = 0;
  let infoRequests = 0;
  let pendingInfo: import("@playwright/test").Route | undefined;
  await page.route("**/api/v1/projects?**", route => route.fulfill({ json: {
    items: [{ id: "a", title: "当前作品" }, { id: "b", title: "参考小说：长标题与写作风格" }], total: 2,
  } }));
  await page.route("**/api/v1/projects/a/references/chapters", async route => {
    if (route.request().method() === "GET") {
      infoRequests++;
      if (infoRequests <= 2) {
        await route.fulfill({ status: 500, json: { detail: "Unavailable" } });
        return;
      }
      if (infoRequests === 3) {
        pendingInfo = route;
        return;
      }
    }
    if (route.request().method() === "PUT") {
      sources = route.request().postDataJSON().source_project_ids.length ? [{ id: "b", title: "参考小说：长标题与写作风格" }] : [];
    }
    await route.fulfill({ json: { sources, used_by: [] } });
  });
  await page.route("**/api/v1/projects/a/references/chapters/b?*", route => {
    const detail = new URL(route.request().url()).searchParams.has("item_id");
    if (detail) detailRequests++;
    return route.fulfill({ json: { items: [{ id: "c", name: "第一章", volume_title: "第一卷", ...(detail ? { content: body } : {}) }] } });
  });
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("http://127.0.0.1:5175/e2e/project-references-harness.html?resource=chapters");
  await page.getByRole("button", { name: "参考正文", exact: true }).click();
  // Do not let a failed initial load turn provisional selections into lost links.
  await expect(page.getByRole("button", { name: "资料加载失败，请关闭后重试。" })).toBeVisible();
  await expect(page.getByRole("checkbox")).toBeDisabled();
  await page.getByRole("button", { name: "资料加载失败，请关闭后重试。" }).click();
  await expect.poll(() => Boolean(pendingInfo)).toBeTruthy();
  await pendingInfo!.fulfill({ json: { sources, used_by: [] } });
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "参考正文", exact: true }).click();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole("button", { name: "查看正文" }).click();
  await expect(page.getByText("第一卷 / 第一章", { exact: true })).toBeVisible();
  expect(detailRequests).toBe(0);
  await page.getByText("第一卷 / 第一章", { exact: true }).click();
  await expect(page.getByText(body, { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("reference-chapters-desktop.png") });
  await page.getByRole("button", { name: "取消", exact: true }).click();
  body = "来源项目更新后的最新正文。";
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "参考正文", exact: true }).click();
  await page.getByRole("button", { name: "查看正文" }).click();
  await page.getByText("第一卷 / 第一章", { exact: true }).click();
  await expect(page.getByText(body, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: testInfo.outputPath("reference-chapters-mobile.png") });
  await page.getByRole("checkbox").uncheck();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "参考正文", exact: true }).click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(page.getByRole("button", { name: "查看正文" })).toHaveCount(0);
});

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
