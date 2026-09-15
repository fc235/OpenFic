import { test, expect } from "@playwright/test";

const harness = "http://127.0.0.1:5175/e2e/editor-usability-harness.html";
test.setTimeout(30_000);
test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => console.error(error.message));
});

test("notes support find and replace while retaining Markdown formatting", async ({ page }) => {
  await page.goto(harness);
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.click();
  await page.keyboard.press("Control+f");
  const search = page.getByPlaceholder("查找...");
  await expect(search).toBeVisible({ timeout: 3000 });
  await search.fill("星光");
  await expect(page.locator(".search-result")).toHaveCount(2);
  await page.keyboard.press("Control+h");
  await page.getByPlaceholder("替换为...").fill("月光");
  await page.getByRole("button", { name: "全部替换", exact: true }).click();
  await expect(editor.locator("strong")).toHaveText("月光");
  await expect(editor.locator("li")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await editor.click();
  await page.keyboard.press("Control+s");
  await expect.poll(() => page.evaluate(() => (window as any).saved)).toContain("**月光**");
});

for (const view of ["project", "project-list"]) {
  test(`${view} edit and delete do not navigate`, async ({ page }) => {
    await page.goto(`${harness}?${view}`);
    await page.getByRole("button", { name: "编辑", exact: true }).click();
    expect(await page.evaluate(() => (window as any).edited)).toBe(true);
    await page.getByRole("button", { name: "删除", exact: true }).click();
    expect(await page.evaluate(() => (window as any).deleted)).toBe(true);
    await expect(page.getByText("已打开项目")).toHaveCount(0);
  });
  test(`${view} opens when clicking near the animated edge`, async ({ page }) => {
    await page.goto(`${harness}?${view}`);
    const card = page.locator(".rt-Card");
    await expect(card).toBeVisible();
    await page.waitForTimeout(300);
    const box = (await card.boundingBox())!;
    const x = view === "project" ? box.x + box.width / 2 : box.x + 1;
    const y = view === "project" ? box.y + box.height - 1 : box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect(page.getByText("已打开项目")).toBeVisible({ timeout: 1500 });
  });

  test(`${view} supports keyboard navigation`, async ({ page }) => {
    await page.goto(`${harness}?${view}`);
    const link = page.getByRole("link", { name: "测试项目" });
    await expect(link).toBeVisible({ timeout: 3000 });
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("已打开项目")).toBeVisible();
  });
}

for (const kind of ["note", "chapter"]) {
  test(`${kind} saves replacement, undo, and pending edits across a record switch`, async ({
    page,
  }) => {
    const saved: { content: string }[] = [];
    const initial = kind === "note" ? "**星光**照耀，星光依旧。" : "星光照耀，星光依旧。\n第二行";
    const entity = {
      id: "test",
      project_id: "p",
      title: "测试",
      content: initial,
      updated_at: "2026-09-14T00:00:00Z",
      created_at: "2026-09-14T00:00:00Z",
      word_count: 18,
    };
    await page.route("**/api/v1/settings", (route) =>
      route.fulfill({ json: { editor_show_line_numbers: true } }),
    );
    await page.route(`**/api/v1/${kind}s/*`, async (route) => {
      const id = route.request().url().split("/").at(-1);
      if (route.request().method() === "PATCH") {
        const data = route.request().postDataJSON();
        saved.push(data);
        await route.fulfill({
          json: { ...entity, ...data, id, updated_at: new Date().toISOString() },
        });
      } else await route.fulfill({ json: { ...entity, id } });
    });
    await page.goto(`${harness}?${kind}`);
    const editor = page.locator('[contenteditable="true"]').first();
    await page.getByRole("button", { name: "查找并替换", exact: true }).click();
    await page.getByPlaceholder("查找...").fill("星光");
    await expect(page.locator(".search-result")).toHaveCount(2);
    await page.screenshot({ path: `test-results/shared-${kind}-editor.png` });
    await page.getByPlaceholder("替换为...").fill("月光");
    await page.getByRole("button", { name: "全部替换", exact: true }).click();
    await page.keyboard.press("Escape");
    await editor.click();
    await page.keyboard.press("Control+s");
    await expect.poll(() => saved.at(-1)?.content).toContain("月光");
    expect(saved.at(-1)?.content).toContain(kind === "note" ? "**月光**" : "\n第二行");
    if (kind === "chapter")
      await expect(page.locator(".tiptap-editor--line-numbers")).toBeVisible();
    await page.keyboard.press("Control+z");
    await expect(editor).toContainText("星光");
    await editor.fill("尚未保存的新内容");
    await page.evaluate(() => (window as any).switchEntity("other"));
    await expect(editor).toContainText("星光");
    await page.evaluate(() => (window as any).switchEntity("test"));
    await expect(editor).toContainText("尚未保存的新内容");
    await page.evaluate(() => (window as any).setLocked(true));
    await expect(page.locator('[contenteditable="true"]')).toHaveCount(0);
    await page.keyboard.press("Control+h");
    await expect(page.getByPlaceholder("替换为...")).toHaveCount(0);
  });
}

test("default model selector saves without blanking settings; prices are not editable", async ({
  page,
}) => {
  let settings = { default_model: "a", light_model: "a" };
  let releaseRefresh: (() => void) | undefined;
  let holdRefresh = false;
  let failSave = false;
  const models = ["a", "b"].map((id) => ({
    id,
    name: `模型${id}`,
    provider_id: "p",
    model_id: id,
    task_type: "llm",
    input_price: 12,
    output_price: 34,
  }));
  await page.route("**/api/v1/models", (route) => route.fulfill({ json: models }));
  await page.route("**/api/v1/model-providers", (route) =>
    route.fulfill({
      json: [
        {
          id: "p",
          name: "提供商",
          provider_type: "openai-compatible",
          supported_task_types: ["llm"],
        },
      ],
    }),
  );
  await page.route("**/api/v1/settings", async (route) => {
    if (route.request().method() === "PUT") {
      if (failSave) {
        await route.fulfill({ status: 500, json: { detail: "save failed" } });
        return;
      }
      settings = { ...settings, ...route.request().postDataJSON() };
      holdRefresh = true;
    } else if (holdRefresh)
      await new Promise<void>((resolve) => {
        releaseRefresh = resolve;
      });
    await route.fulfill({ json: settings });
  });
  await page.goto(`${harness}?settings`);
  await page.getByRole("button", { name: "模型a", exact: true }).first().click();
  await page.getByRole("dialog").getByText("模型b", { exact: true }).click();
  await expect.poll(() => settings.default_model).toBe("b");
  await expect.poll(() => !!releaseRefresh).toBe(true);
  await expect(page.getByText("模型b", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "模型b", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "设为默认模型", exact: true })).toHaveCount(0);
  holdRefresh = false;
  releaseRefresh!();
  await page.screenshot({ path: "test-results/default-model-settings.png" });
  failSave = true;
  await page.getByRole("button", { name: "模型b", exact: true }).click();
  await page.getByRole("dialog").getByText("模型a", { exact: true }).click();
  await expect(page.getByRole("button", { name: "模型b", exact: true })).toBeEnabled();
  expect(settings.default_model).toBe("b");
  await page.getByRole("button", { name: "编辑模型", exact: true }).first().click();
  await page.getByRole("button", { name: "元数据", exact: false }).click();
  await expect(page.getByRole("spinbutton", { name: "上下文长度" })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: /价格/ })).toHaveCount(0);
});

test("conversation model menu keeps session selection separate from the global default", async ({
  page,
}) => {
  let settings = { default_model: "a" };
  const writes: unknown[] = [];
  let failSave = false;
  await page.route("**/api/v1/settings", async (route) => {
    if (route.request().method() === "PUT") {
      writes.push(route.request().postDataJSON());
      if (failSave) {
        await route.fulfill({ status: 500, json: { detail: "save failed" } });
        return;
      }
      settings = { ...settings, ...route.request().postDataJSON() };
    }
    await route.fulfill({ json: settings });
  });
  await page.goto(`${harness}?composer`);
  await page.getByRole("button", { name: "模型a", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("默认模型", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "已是默认模型", exact: true })).toHaveCount(0);
  await page.getByRole("dialog").getByText("模型b", { exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "模型b", exact: true })).toBeVisible();
  expect(writes).toEqual([]);
  await page.getByRole("button", { name: "模型b", exact: true }).click();
  await expect(page.getByRole("button", { name: "设为默认模型", exact: true })).toHaveCount(0);
  await page.getByRole("dialog").getByRole("button", { name: "模型b", exact: true }).dblclick();
  await expect(page.getByText("已更新默认模型", { exact: true })).toBeVisible();
  expect(writes).toEqual([{ default_model: "b" }]);
  await expect(
    page.getByRole("dialog").getByText("模型b", { exact: true }).locator(".."),
  ).toContainText("默认模型");
  await page.screenshot({ path: "test-results/default-model-conversation.png" });
  await expect(page.getByRole("dialog").getByText("默认模型", { exact: true })).toBeVisible();
  failSave = true;
  await expect(page.getByRole("button", { name: "已是默认模型", exact: true })).toHaveCount(0);
  await page.getByRole("dialog").getByText("模型a", { exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "模型a", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "模型a", exact: true }).dblclick();
  await expect(page.getByText("保存失败", { exact: true })).toBeVisible();
  expect(settings.default_model).toBe("b");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "模型a", exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "模型a", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("默认模型", { exact: true })).toBeVisible();
  expect(settings.default_model).toBe("b");
});

test("conversation double click saves the global default without switching the session", async ({
  page,
}) => {
  let settings = { default_model: "a" };
  const writes: unknown[] = [];
  await page.route("**/api/v1/settings", async (route) => {
    if (route.request().method() === "PUT") {
      writes.push(route.request().postDataJSON());
      settings = { ...settings, ...route.request().postDataJSON() };
    }
    await route.fulfill({ json: settings });
  });
  await page.goto(`${harness}?composer`);
  const trigger = page
    .locator(".ai-sidebar-model-selector")
    .getByRole("button", { name: "模型a", exact: true });
  await trigger.click();
  await page.getByRole("dialog").getByRole("button", { name: "模型b", exact: true }).dblclick();
  await expect(page.getByText("已更新默认模型", { exact: true })).toBeVisible();
  await page.waitForTimeout(300);
  await expect(trigger).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(writes).toEqual([{ default_model: "b" }]);
  expect(settings.default_model).toBe("b");
});
