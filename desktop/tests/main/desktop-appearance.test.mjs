import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { isDesktopInstanceAppearance } from "../../dist/shared/config.js";

test("theme validation allows upstream palettes but rejects unrelated or invalid CSS variables", () => {
  assert.equal(isDesktopInstanceAppearance({appearance:"dark",fontFamily:"Example",themeVariables:{"--accent-9":"#007acc","--color-overlay":"rgba(0,0,0,.5)"}}),true);
  assert.equal(isDesktopInstanceAppearance({themeVariables:{"position":"fixed"}}),false);
  assert.equal(isDesktopInstanceAppearance({themeVariables:{"--accent-9":123}}),false);
  assert.equal(isDesktopInstanceAppearance({appearance:"system"}),false);
});

test("dev appearance persistence preserves selected data directory and partial font/theme updates", async t => {
  const root=await mkdtemp(path.join(os.tmpdir(),"openfic-dev-appearance-"));
  t.mock.module("electron",{namedExports:{net:{},app:{getAppPath:()=>path.join(root,"desktop"),getPath:()=>root}}});
  const {persistDevInstanceDataDir,persistDevInstanceAppearance,readDevInstanceDataDir,readDevInstanceAppearance}=await import("../../dist/main/runtime/dev-backend.js");
  const previous=process.env.OPENFIC_DEV_DATA_DIR;
  delete process.env.OPENFIC_DEV_DATA_DIR;
  t.after(()=>{if(previous===undefined) delete process.env.OPENFIC_DEV_DATA_DIR;else process.env.OPENFIC_DEV_DATA_DIR=previous;});
  await persistDevInstanceDataDir(path.join(root,"stories"));
  await persistDevInstanceAppearance({appearance:"dark",themeVariables:{"--accent-9":"#007acc"}});
  await persistDevInstanceAppearance({fontFamily:"Example Serif"});
  assert.equal(await readDevInstanceDataDir(),path.join(root,"stories"));
  assert.deepEqual(await readDevInstanceAppearance(),{appearance:"dark",fontFamily:"Example Serif",codeFontFamily:undefined,themeVariables:{"--accent-9":"#007acc"}});
  await persistDevInstanceDataDir(path.join(root,"moved-stories"));
  assert.equal((await readDevInstanceAppearance()).themeVariables["--accent-9"],"#007acc");
});
