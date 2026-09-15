import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const desktop = fileURLToPath(new URL("../..", import.meta.url));
const frontendRequire = createRequire(path.join(desktop, "../frontend/package.json"));
const { _electron, chromium } = createRequire(frontendRequire.resolve("@playwright/test"))("playwright");
const testRoot = await mkdtemp(path.join(desktop, "dist-electron/lifecycle-smoke-"));
const profile = path.join(testRoot, "profile");
const bootstrap = path.join(testRoot, "bootstrap.mjs");
await writeFile(bootstrap, `
import { app, dialog } from "electron";
app.setPath("userData", ${JSON.stringify(profile)});
app.setAppPath(${JSON.stringify(desktop)});
globalThis.errors = [];
dialog.showErrorBox = (title, message) => globalThis.errors.push({ title, message });
await import(${JSON.stringify(pathToFileURL(path.join(desktop, "dist/main/main.js")).href)});
`);

async function waitFor(operation, description, timeout = 90_000) {
  const until = Date.now() + timeout;
  let last;
  while (Date.now() < until) {
    try { const result = await operation(); if (result) return result; }
    catch (error) { last = error; }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out: ${description}; ${last ?? ""}`);
}

const electron = await _electron.launch({
  executablePath: process.env.OPENFIC_TEST_ELECTRON ?? path.join(desktop, "dist-electron/electron-43.4.0-x64/electron.exe"),
  args: [bootstrap],
  env: { ...process.env, OPENFIC_DEV_MODE: "1", OPENFIC_DEV_DATA_DIR: path.join(testRoot, "data"), UV_NO_SYNC: "1" },
});
const electronProcess = electron.process();

const host = async expression => {
  const page = electron.windows().find(page => !page.isClosed());
  if (!page) return null;
  let timer;
  try {
    return await Promise.race([
      page.evaluate(async expression => document.querySelector("webview")?.executeJavaScript(expression) ?? null, expression),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("webview reloading")), 2500); }),
    ]);
  } finally { clearTimeout(timer); }
};

let baseUrl;
try {
  let window = await electron.firstWindow();
  baseUrl = await waitFor(async () => (await window.evaluate(async () => {
    const response = await fetch("app://setup/runtime-config.json");
    return response.json();
  }))?.backendBaseUrl, "backend startup");
  await waitFor(() => host("window.openficDesktopHost?.getDesktopPreferences?.()"), "desktop IPC bridge");
  assert.equal((await fetch(`${baseUrl}/api/v1/health`)).status, 200);
  console.log("PASS backend starts and desktop IPC bridge is available");

  await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].close());
  const closeDialog = () => window.getByRole("dialog", { name: "关闭 OpenFic" });
  await closeDialog().waitFor();
  await electron.evaluate(({BrowserWindow}) => { BrowserWindow.getAllWindows()[0].close(); BrowserWindow.getAllWindows()[0].close(); });
  assert.equal(await closeDialog().count(), 1);
  assert.equal(await window.getByRole("radio", { name: /^仅退出前端/ }).isChecked(), true);
  await window.screenshot({path:path.join(testRoot,"close-dialog-light.png")});
  await window.keyboard.press("Escape");
  await closeDialog().waitFor({state:"hidden"});
  assert.equal(await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows().length), 1);
  await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].close());
  await closeDialog().waitFor();
  await window.mouse.click(5,60);
  await closeDialog().waitFor({state:"hidden"});
  await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].close());
  await closeDialog().waitFor();
  await window.reload();
  await waitFor(() => host("window.openficDesktopHost?.getDesktopPreferences?.()"), "bridge after dialog reload");
  assert.equal(await closeDialog().isVisible(), false);
  await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].close());
  await closeDialog().waitFor();
  await window.getByRole("radio", { name: /^完全退出/ }).check();
  assert.equal(await window.getByRole("button", {name:"完全退出",exact:true}).isVisible(),true);
  await window.getByRole("button", {name:"取消",exact:true}).click();
  await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].close());
  await closeDialog().waitFor();
  await window.getByRole("checkbox", {name:"记住我的选择"}).check();
  await window.getByRole("button", {name:"仅退出前端",exact:true}).click();
  await waitFor(() => electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows().length === 0), "frontend closes");
  assert.equal((await fetch(`${baseUrl}/api/v1/health`)).status, 200);
  assert.equal(electronProcess.exitCode, null);
  console.log("PASS cancel keeps the window; frontend-only closes renderers but backend stays healthy");

  await electron.evaluate(({app}) => app.emit("second-instance", {}, [], ""));
  window = await electron.firstWindow();
  const state = await waitFor(() => host("window.openficDesktopHost?.getDesktopPreferences?.()"), "reopened bridge");
  assert.equal(state.closeBehavior, "frontend");
  const reopenedUrl = await window.evaluate(async () => (await (await fetch("app://setup/runtime-config.json")).json()).backendBaseUrl);
  assert.equal(reopenedUrl, baseUrl);
  console.log("PASS reopen reuses the same backend URL and remembered close preference");

  await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].close());
  await waitFor(() => electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows().length === 0), "remembered frontend closes directly");
  assert.equal((await fetch(`${baseUrl}/api/v1/health`)).status, 200);
  await electron.evaluate(({app}) => app.emit("second-instance", {}, [], ""));
  window = await electron.firstWindow();
  await waitFor(() => host("window.openficDesktopHost?.getDesktopPreferences?.()"), "bridge after direct frontend close");

  await host("window.openficDesktopHost.saveDesktopPreferences({lanEnabled:true})");
  const lan = await waitFor(async () => {
    const state = await host("window.openficDesktopHost?.getDesktopPreferences?.()");
    return state?.addresses.length && !state.lanPending ? state : null;
  }, "LAN restart");
  // Prefer a private LAN address over benchmark adapters exposed by VPN clients.
  const lanUrl = (lan.addresses.find(({url}) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(new URL(url).hostname)) ?? lan.addresses[0]).url;
  assert.equal(new URL(lanUrl).port, new URL(baseUrl).port);
  const response = await fetch(lanUrl, {signal:AbortSignal.timeout(5000)});
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<html/i);
  await waitFor(() => host('document.querySelector(".projects-page") !== null'), "full desktop frontend");
  await window.screenshot({path:path.join(testRoot,"desktop.png")});
  await host("window.openficDesktopHost.saveDesktopPreferences({closeBehavior:'ask'})");
  await host("window.openficDesktopHost.publishAppearance({appearance:'dark',fontFamily:'Times New Roman',themeVariables:{'--accent-9':'#007acc','--accent-10':'#006bb3','--accent-contrast':'#ffffff','--accent-a3':'rgba(0,122,204,0.15)','--accent-8':'#007acc'}})");
  await waitFor(() => window.locator('.desktop-shell.dark').count(), "dark shell appearance");
  await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].close());
  await closeDialog().waitFor();
  for (let index = 0; index < 8; index++) {
    await window.keyboard.press("Tab");
    assert.equal(await closeDialog().evaluate(element => element.contains(document.activeElement)),true);
  }
  const customStyle = await closeDialog().evaluate(element => ({
    font:getComputedStyle(element).fontFamily,
    radius:getComputedStyle(element).borderRadius,
    primary:getComputedStyle(element.querySelector('.desktop-close-confirm')).backgroundColor,
    selected:getComputedStyle(element.querySelector('[data-selected="true"]')).borderColor,
  }));
  assert.match(customStyle.font,/Times New Roman/);
  assert.notEqual(customStyle.radius,"0px");
  assert.equal(customStyle.primary,"rgb(0, 122, 204)");
  assert.equal(customStyle.selected,"rgb(0, 122, 204)");
  await window.screenshot({path:path.join(testRoot,"close-dialog-dark.png")});
  await window.keyboard.press("Escape");
  await closeDialog().waitFor({state:"hidden"});
  console.log("PASS dialog follows dark appearance and traps keyboard focus");
  const mobileBrowser = await chromium.launch({channel:"chrome"});
  try {
    const mobile = await mobileBrowser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await mobile.goto(lanUrl);
    await mobile.locator(".projects-page").waitFor({timeout:30000});
    await mobile.screenshot({path:path.join(testRoot,"mobile.png")});
  } finally { await mobileBrowser.close(); }
  console.log("PASS LAN address serves full frontend HTML using the original port");
  await host("window.openficDesktopHost.saveDesktopPreferences({lanEnabled:false})");
  await waitFor(async () => {
    const state = await host("window.openficDesktopHost?.getDesktopPreferences?.()");
    return state?.backendRunning && !state.lanPending && state.addresses.length === 0;
  }, "LAN disabled");
  console.log("PASS disabling LAN restores local-only binding");

  await electron.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].close());
  await closeDialog().waitFor();
  await window.getByRole("radio", {name:/^完全退出/}).check();
  await window.getByRole("checkbox", {name:"记住我的选择"}).check();
  await window.getByRole("button", {name:"完全退出",exact:true}).click();
  await waitFor(() => electronProcess.exitCode !== null, "complete exit", 30_000);
  await waitFor(async () => { try { await fetch(`${baseUrl}/api/v1/health`,{signal:AbortSignal.timeout(500)});return false; } catch { return true; } }, "backend stops");
  console.log(`PASS fully quit stops backend; artifacts: ${testRoot}`);
} finally {
  if (electronProcess.exitCode === null) await electron.close();
}
