import { expect, test } from "@playwright/test";

import { openProject } from "./helpers";

const SETTINGS_URL = "/api/v1/settings";
const PRESET = "请分析当前项目，并给出下一步写作建议。";
let projectId = "";
let providerId = "";
let modelId = "";

test.beforeEach(async ({ page }) => {
  const uniqueName = `Quick Start E2E ${Date.now()}`;
  const providerResponse = await page.request.post("/api/v1/model-providers", {
    form: {
      name: uniqueName,
      url: "https://example.invalid/v1",
      api_key: "test-key",
      provider_type: "openai-compatible",
    },
  });
  expect(providerResponse.status()).toBe(201);
  providerId = ((await providerResponse.json()) as { id: string }).id;

  const modelResponse = await page.request.post("/api/v1/models", {
    data: {
      name: uniqueName,
      provider_id: providerId,
      model_id: "quick-start-e2e",
    },
  });
  expect(modelResponse.status()).toBe(201);
  modelId = ((await modelResponse.json()) as { id: string }).id;

  const projectResponse = await page.request.post("/api/v1/projects", {
    form: { title: "快捷新会话 E2E" },
  });
  expect(projectResponse.status()).toBe(201);
  projectId = ((await projectResponse.json()) as { id: string }).id;

  const response = await page.request.patch(SETTINGS_URL, {
    data: {
      default_model: modelId,
      quick_start_enabled: false,
      quick_start_prompt: "",
    },
  });
  expect(response.status()).toBe(200);
});

test.afterEach(async ({ page }) => {
  await page.request.patch(SETTINGS_URL, {
    data: { default_model: "", quick_start_enabled: false },
  });
  if (projectId) await page.request.delete(`/api/v1/projects/${projectId}`);
  if (modelId) await page.request.delete(`/api/v1/models/${modelId}`);
  if (providerId) await page.request.delete(`/api/v1/model-providers/${providerId}`);
  projectId = "";
  modelId = "";
  providerId = "";
});

test("配置后可使用预设创建新会话", async ({ page }) => {
  await openProject(page, `/projects/${projectId}`);
  const quickStartButton = page.getByRole("button", { name: "使用预设开始" });
  await expect(quickStartButton).toHaveCount(0);

  await page.getByRole("button", { name: "设置" }).click();
  const prompt = page.getByRole("textbox", { name: "启动提示词" });
  const enabled = page.getByRole("switch", { name: "启用快捷新会话" });
  await prompt.fill(PRESET);

  const promptSave = page.waitForResponse(
    (response) => response.url().endsWith(SETTINGS_URL) && response.request().method() === "PUT",
  );
  await prompt.blur();
  expect((await promptSave).status()).toBe(200);

  const enabledSave = page.waitForResponse(
    (response) => response.url().endsWith(SETTINGS_URL) && response.request().method() === "PUT",
  );
  await enabled.click();
  expect((await enabledSave).status()).toBe(200);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(quickStartButton).toBeVisible();

  const messageRequestPromise = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      request.url().includes("/api/v1/agent/sessions/") &&
      request.url().endsWith("/message"),
    { timeout: 60000 },
  );
  await quickStartButton.click();
  const messageRequest = await messageRequestPromise;
  const body = messageRequest.postDataJSON() as { message: string };
  expect(body.message).toBe(PRESET);
  await expect(page.getByText(PRESET).first()).toBeVisible();
});
