import { expect, test } from "@playwright/test";

const harness = "http://127.0.0.1:5173/e2e/upstream-fixes-harness.html";
test.setTimeout(30_000);

test("IME confirmation and legacy keyCode 229 never submit", async ({ page }) => {
  await page.goto(`${harness}?mode=composer`);
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  for (const options of [{ isComposing: true }, { keyCode: 229 }]) {
    await editor.evaluate(
      (element, init) =>
        element.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            bubbles: true,
            cancelable: true,
            ...init,
          }),
        ),
      options,
    );
  }
  expect(await page.evaluate(() => (window as any).submitCount)).toBe(0);
  await editor.press("Enter");
  expect(await page.evaluate(() => (window as any).submitCount)).toBe(1);
});

test("mobile Enter inserts a newline instead of sending", async ({ page }) => {
  await page.goto(`${harness}?mode=composer&mobile=1`);
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  const initialParagraphs = await editor.locator("p").count();
  await editor.press("End");
  await editor.press("Enter");
  expect(await page.evaluate(() => (window as any).submitCount)).toBe(0);
  await expect(editor.locator("p")).toHaveCount(initialParagraphs + 1);
});

test("CRLF save echoes preserve Markdown selection and document identity", async ({ page }) => {
  await page.goto(`${harness}?mode=markdown`);
  await expect(page.locator(".ProseMirror")).toBeVisible();
  await page.evaluate(() => {
    const editor = (window as any).getEditor();
    editor.commands.focus();
    editor.commands.setTextSelection(4);
    (window as any).originalDoc = editor.state.doc;
    (window as any).setRemoteContent("first\r\n\r\nsecond");
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).getEditor().getMarkdown()))
    .toBe("first\n\nsecond");
  expect(
    await page.evaluate(
      () => (window as any).getEditor().state.doc === (window as any).originalDoc,
    ),
  ).toBe(true);
  expect(await page.evaluate(() => (window as any).getEditor().state.selection.from)).toBe(4);
});

test("failed character drafts survive switching away and back", async ({ page }) => {
  await page.goto(harness);
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  await page.evaluate(() => {
    (window as any).failSaves = true;
  });
  await editor.press("Control+Home");
  await page.keyboard.insertText("draft ");
  await expect.poll(() => page.evaluate(() => (window as any).saves.length)).toBe(1);
  await page.evaluate(() => (window as any).selectEntity("b"));
  await expect(page.locator("input").first()).toHaveValue("Bob");
  await page.evaluate(() => (window as any).selectEntity("a"));
  await expect(editor).toContainText("draft first");
});

test("edits during an in-flight save survive unmount and are saved afterwards", async ({
  page,
}) => {
  await page.goto(harness);
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  await page.evaluate(() => {
    (window as any).holdSaves = true;
  });
  await editor.press("Control+Home");
  await page.keyboard.insertText("one ");
  await expect.poll(() => page.evaluate(() => (window as any).saves.length)).toBe(1);
  await page.keyboard.insertText("two ");
  await page.evaluate(() => (window as any).selectEntity("b"));
  await expect(page.locator("input").first()).toHaveValue("Bob");
  await page.evaluate(() => {
    (window as any).holdSaves = false;
    (window as any).pendingSaves.shift()();
  });
  await expect.poll(() => page.evaluate(() => (window as any).saves.length)).toBe(2);
  expect(await page.evaluate(() => (window as any).saves[1].description)).toContain(
    "one two first",
  );
  await page.evaluate(() => (window as any).selectEntity("a"));
  await expect(editor).toContainText("one two first");
});

test("Agent lock blocks pending autosave until editing is unlocked", async ({ page }) => {
  await page.goto(harness);
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  await editor.press("Control+Home");
  await page.keyboard.insertText("locked draft ");
  await page.evaluate(() => {
    (window as any).canSave = false;
    (window as any).setLocked(true);
  });
  await expect(editor).toHaveAttribute("contenteditable", "false");
  // Cross the actual autosave debounce to prove no request was made under lock.
  await page.waitForTimeout(1700);
  expect(await page.evaluate(() => (window as any).saves.length)).toBe(0);
  await page.evaluate(() => {
    (window as any).canSave = true;
    (window as any).setLocked(false);
  });
  await expect.poll(() => page.evaluate(() => (window as any).saves.length)).toBe(1);
});

test("a failed draft can be retried explicitly without retyping", async ({ page }) => {
  await page.goto(harness);
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  await page.evaluate(() => {
    (window as any).failSaves = true;
  });
  await editor.press("Control+Home");
  await page.keyboard.insertText("retry ");
  await expect.poll(() => page.evaluate(() => (window as any).saves.length)).toBe(1);
  await page.waitForTimeout(1700);
  expect(await page.evaluate(() => (window as any).saves.length)).toBe(1);
  await page.evaluate(() => {
    (window as any).failSaves = false;
  });
  await editor.press("Control+s");
  await expect.poll(() => page.evaluate(() => (window as any).saves.length)).toBe(2);
  await page.evaluate(() => (window as any).selectEntity("b"));
  await expect(page.locator("input").first()).toHaveValue("Bob");
  await page.evaluate(() => (window as any).selectEntity("a"));
  await expect(editor).toContainText("retry first");
});

test("failed world-info drafts survive entity changes and retain local content", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/api/v1/world-info-entries/*", async (route) => {
    requests++;
    await route.fulfill({ status: 500, json: { detail: "save failed" } });
  });
  await page.goto(`${harness}?mode=world`);
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  await editor.press("Control+Home");
  await page.keyboard.insertText("world draft ");
  await expect.poll(() => requests).toBe(1);
  await page.evaluate(() => (window as any).selectEntity("b"));
  await expect(page.locator("input").first()).toHaveValue("Bob");
  await page.evaluate(() => (window as any).selectEntity("a"));
  await expect(editor).toContainText("world draft first");
});

test("world-info saves keep edits made during an async save after switching away", async ({
  page,
}) => {
  const writes: Array<{ id: string; content: string; token_count: number }> = [];
  let releaseFirst: (() => void) | undefined;
  await page.route("**/api/v1/world-info-entries/*", async (route) => {
    const id = route.request().url().split("/").at(-1)!;
    const data = route.request().postDataJSON();
    writes.push({ id, ...data });
    if (writes.length === 1)
      await new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });
    await route.fulfill({
      json: {
        id,
        world_info_id: "w",
        uid: 1,
        order: 1,
        is_enabled: true,
        created_at: "2026-10-09",
        updated_at: "2026-10-09",
        ...data,
      },
    });
  });
  await page.goto(`${harness}?mode=world`);
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  await editor.press("Control+Home");
  await page.keyboard.insertText("one ");
  await expect.poll(() => writes.length).toBe(1);
  await page.keyboard.insertText("two ");
  await page.evaluate(() => (window as any).selectEntity("b"));
  await expect(page.locator("input").first()).toHaveValue("Bob");
  releaseFirst!();
  await expect.poll(() => writes.length).toBe(2);
  expect(writes[1].id).toBe("a");
  expect(writes[1].content).toContain("one two first");
  expect(writes[1].token_count).toBeGreaterThan(0);
  await page.evaluate(() => (window as any).selectEntity("a"));
  await expect(editor).toContainText("one two first");
});

test("an older character detail response cannot overwrite a successful save", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.stack ?? error.message));
  let detailRequests = 0;
  let saveRequests = 0;
  let releaseOldDetail: (() => void) | undefined;
  const character = {
    id: "a",
    project_id: "p",
    name: "Alice",
    description: "first\n\nsecond",
    token_count: 3,
    is_favorited: false,
    created_at: "2026-10-09",
    updated_at: "2026-10-09",
  };
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes("/references/")) return route.fulfill({ json: { sources: [], used_by: [] } });
    if (path === "/api/v1/characters/a") {
      if (route.request().method() === "PATCH") {
        saveRequests++;
        return route.fulfill({ json: { ...character, description: "draft first\n\nsecond" } });
      }
      detailRequests++;
      if (detailRequests > 1)
        await new Promise<void>((resolve) => {
          releaseOldDetail = resolve;
        });
      return route.fulfill({ json: character }).catch(() => {});
    }
    if (path === "/api/v1/projects/p/characters")
      return route.fulfill({ json: { items: [character], total: 1 } });
    if (path === "/api/v1/projects")
      return route.fulfill({ json: { items: [{ id: "p", title: "Project" }], total: 1 } });
    return route.fulfill({ json: {} });
  });
  await page.goto(`${harness}?mode=characters-page`);
  const editor = page.locator(".ProseMirror");
  await expect(editor)
    .toBeVisible()
    .catch((error) => {
      throw new Error(`${error.message}\nPage errors: ${pageErrors.join("; ")}`);
    });
  await page.evaluate(() => {
    void (window as any).queryClient.refetchQueries({ queryKey: ["character", "a"] });
  });
  await expect.poll(() => detailRequests).toBe(2);
  await editor.press("Control+Home");
  await page.keyboard.insertText("draft ");
  await expect.poll(() => saveRequests).toBe(1);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as any).queryClient.getQueriesData({ queryKey: ["character", "a"] })[0]?.[1]
            ?.description,
      ),
    )
    .toContain("draft first");
  releaseOldDetail!();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).queryClient.isFetching({ queryKey: ["character", "a"] })),
    )
    .toBe(0);
  await expect(editor).toContainText("draft first");
});
