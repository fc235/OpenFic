import { expect, test, type Page } from "@playwright/test";

const harness = "http://127.0.0.1:5173/e2e/upstream-features-harness.html";

async function mockApi(page: Page) {
  const requests: { method: string; path: string; query: string; body: any }[] = [];
  const settings = { language: "en", theme: "light", font_family: "system", default_model: "m" };
  const graph = {
    nodes: [
      { character_id: "a", name: "Alice", image_url: null, x: 0, y: 0, relationship_count: 1 },
      { character_id: "b", name: "Bob", image_url: null, x: 350, y: 0, relationship_count: 1 },
    ],
    relationships: [
      {
        id: "rel",
        source_character_id: "a",
        target_character_id: "b",
        name: "Friend",
        description: "They met at school",
      },
    ],
  };
  await page.routeWebSocket(/\/socket\.io\//, (socket) => {
    socket.send('0{"sid":"harness","upgrades":[],"pingInterval":100000,"pingTimeout":100000}');
    socket.onMessage((message) => {
      if (message === "40") socket.send('40{"sid":"harness"}');
      if (message === "2") socket.send("3");
    });
  });
  await page.route("**/icons/model/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg"/>',
    }),
  );
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/v1", "");
    const body = request.postData() ? request.postDataJSON() : null;
    requests.push({ method: request.method(), path, query: url.search, body });
    let response: any = [];
    if (path === "/settings") {
      if (request.method() === "PUT") Object.assign(settings, body);
      response = settings;
    } else if (path === "/projects/p/character-graph") response = graph;
    else if (path === "/character-relationships/rel" && request.method() === "PATCH") {
      Object.assign(graph.relationships[0], body);
      response = graph.relationships[0];
    } else if (path === "/projects/p/agent-composer-items")
      response = {
        skills: [{ id: "skill", name: "Revision", description: "Revise prose" }],
        chapters: [{ kind: "chapter", id: "chapter", title: "Arrival", label: "Arrival" }],
        notes: [],
        world_info_entries: [],
      };
    else if (path === "/model-provider-catalog/providers")
      response = [
        { provider_type: "openai", display_name: "OpenAI", api: "https://api.openai.com/v1" },
      ];
    else if (path === "/openai-codex/auth/start")
      response = {
        authorization_id: "auth-id",
        authorization_url: "https://auth.openai.com/authorize?state=test",
      };
    else if (path === "/openai-codex/auth/status/auth-id")
      response = {
        status: "pending",
        provider_id: null,
        registration_id: null,
      };
    else if (path === "/openai-codex/auth/auth-id")
      response = {
        status: "cancelled",
        provider_id: null,
        registration_id: null,
      };
    else if (path.includes("/changes"))
      response = {
        session_id: path.split("/")[3],
        session_changes: { added: 0, removed: 0, items: [] },
        revisions: [],
      };
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(response) });
  });
  return requests;
}

test("composer reference panel loads candidates on demand and inserts a chapter", async ({
  page,
}) => {
  const requests = await mockApi(page);
  await page.goto(harness);
  const button = page.locator(".agent-composer-add-trigger");
  await expect(button).toBeVisible();
  expect(requests.filter((r) => r.path.endsWith("agent-composer-items"))).toHaveLength(0);
  await button.click();
  await page.getByRole("button", { name: "ArrivalChapter", exact: true }).click();
  await expect(page.locator(".ProseMirror")).toContainText("Arrival");
  expect(requests.filter((r) => r.path.endsWith("agent-composer-items"))).toHaveLength(1);
  expect(await page.evaluate(() => (window as any).inputValue)).toContain("chapter");
});

test("composer accepts text attachments and removes their cards", async ({ page }) => {
  await mockApi(page);
  await page.goto(harness);
  const input = page.locator('input[type="file"]').last();
  await expect(page.locator(".ProseMirror")).toBeVisible();
  await input.setInputFiles({
    name: "outline.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("Plot"),
  });
  await expect(page.getByText("outline.md", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as any).attachments.length)).toBe(1);
  await page.getByRole("button", { name: /remove.*outline|remove attachment/i }).click();
  await expect(page.getByText("outline.md", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).attachments.length)).toBe(0);
});

test("character graph loads relationships and opens the selected character", async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto(`${harness}?mode=graph`);
  await expect(page.locator('.react-flow__node[data-id="a"]')).toBeVisible();
  await expect(page.locator(".react-flow__edge-text")).toContainText("Friend");
  await page.locator('.react-flow__node[data-id="a"]').dblclick();
  expect(await page.evaluate(() => (window as any).selectedCharacter)).toBe("a");
  expect(requests.some((r) => r.path === "/projects/p/character-graph")).toBe(true);
});

test("character graph edits a relationship through its API", async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto(`${harness}?mode=graph`);
  const edge = page.locator(".react-flow__edge");
  await expect(edge).toBeVisible();
  await edge.dblclick();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("input").fill("Ally");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => requests.find((r) => r.method === "PATCH")?.body.name).toBe("Ally");
  await expect(page.locator(".react-flow__edge-text")).toContainText("Ally");
});

test("context settings persist ratios as fractions and reject empty budgets", async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto(`${harness}?mode=context`);
  const fields = page.getByRole("spinbutton");
  await expect(fields).toHaveCount(6);
  await fields.nth(0).fill("75");
  await fields.nth(1).fill("");
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await fields.nth(1).fill("15000");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .poll(() => requests.find((r) => r.method === "PUT")?.body)
    .toEqual({
      compaction_trigger_ratio: 0.75,
      compaction_tail_token_budget: 15000,
    });
});

test("context tool-output pruning is saved independently", async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto(`${harness}?mode=context`);
  await page.getByRole("switch", { name: /prun/i }).click();
  await expect
    .poll(() => requests.find((r) => r.method === "PUT")?.body)
    .toEqual({
      auto_prune_tool_outputs: true,
    });
});

test("Codex OAuth starts and cancels with the backend authorization id", async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto(`${harness}?mode=connections`);
  await page.getByRole("button", { name: /new connection/i }).click();
  const provider = page.locator(".provider-id-select-trigger");
  await provider.click();
  await page.getByText("OpenAI Codex", { exact: true }).click();
  await page.getByRole("button", { name: /sign in with ChatGPT/i }).click();
  const cancel = page.getByRole("button", { name: /cancel authorization/i });
  await expect(cancel).toBeVisible();
  expect(await page.evaluate(() => (window as any).authorizationUrl)).toContain("auth.openai.com");
  await cancel.click();
  await expect
    .poll(() =>
      requests.some((r) => r.method === "DELETE" && r.path === "/openai-codex/auth/auth-id"),
    )
    .toBe(true);
  await expect(page.getByRole("button", { name: /sign in with ChatGPT/i })).toBeVisible();
});

test("session changes fetch only a summary until a revision is opened", async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto(`${harness}?mode=history`);
  await expect(page.getByRole("button", { name: "Inspect revision" })).toBeVisible();
  await page.evaluate(() => (window as any).loadSession());
  await expect.poll(() => page.evaluate(() => (window as any).sessionId)).toBe("s");
  expect(requests.filter((r) => r.path.endsWith("/changes/details"))).toHaveLength(0);
  await page.getByRole("button", { name: "Inspect revision" }).click();
  await expect
    .poll(() => requests.find((r) => r.path.endsWith("/changes/details")))
    .toMatchObject({
      path: "/agent/sessions/s/changes/details",
      query: "?revision_id=r1",
    });
});
