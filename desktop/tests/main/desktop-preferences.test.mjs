import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

test("preferences default safely, merge concurrent writes and list usable LAN addresses", async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), "openfic-preferences-"));
  t.mock.module("electron", { namedExports: { app: { getPath: () => root } } });
  const { readDesktopPreferences, saveDesktopPreferences, getLanAddresses } = await import("../../dist/main/desktop-preferences.js");
  assert.deepEqual(await readDesktopPreferences(), {closeBehavior:"ask",lanEnabled:false});
  await Promise.all([saveDesktopPreferences({closeBehavior:"frontend"}),saveDesktopPreferences({lanEnabled:true})]);
  assert.deepEqual(await readDesktopPreferences(), {closeBehavior:"frontend",lanEnabled:true});
  assert.equal(JSON.parse(await readFile(path.join(root,"desktop-preferences.json"))).lanEnabled,true);
  await assert.rejects(saveDesktopPreferences({lanEnabled:"true"}));
  await assert.rejects(saveDesktopPreferences({closeBehavior:"delete"}));
  const entry = address => ({address,family:"IPv4",internal:false});
  assert.deepEqual(getLanAddresses(18001, {
    Loopback:[{...entry("127.0.0.1"),internal:true}],
    Wifi:[entry("192.168.1.8")], Wired:[entry("10.1.2.3")],
    Offline:[entry("169.254.1.1")], Duplicate:[entry("192.168.1.8")],
  }), [{name:"Wifi",url:"http://192.168.1.8:18001"},{name:"Wired",url:"http://10.1.2.3:18001"}]);
});
