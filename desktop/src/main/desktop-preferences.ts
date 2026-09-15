import { app } from "electron";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { networkInterfaces, type NetworkInterfaceInfo } from "node:os";
import path from "node:path";
import type { DesktopPreferences } from "../shared/desktop-preferences.js";

const defaults: DesktopPreferences = { closeBehavior: "ask", lanEnabled: false };
let pendingWrite: Promise<unknown> = Promise.resolve();

export async function readDesktopPreferences(): Promise<DesktopPreferences> {
  try {
    const data = JSON.parse(await readFile(path.join(app.getPath("userData"), "desktop-preferences.json"), "utf8"));
    return {
      closeBehavior: ["ask", "quit", "frontend"].includes(data?.closeBehavior) ? data.closeBehavior : "ask",
      lanEnabled: data?.lanEnabled === true,
    };
  } catch (error) {
    if (error instanceof SyntaxError || (error as NodeJS.ErrnoException).code === "ENOENT") return { ...defaults };
    throw error;
  }
}

export function saveDesktopPreferences(patch: unknown): Promise<DesktopPreferences> {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return Promise.reject(new Error("无效的桌面设置"));
  const values = patch as Partial<DesktopPreferences>;
  if (Object.keys(values).some((key) => key !== "closeBehavior" && key !== "lanEnabled") ||
    (values.closeBehavior !== undefined && !["ask", "quit", "frontend"].includes(values.closeBehavior)) ||
    (values.lanEnabled !== undefined && typeof values.lanEnabled !== "boolean")) {
    return Promise.reject(new Error("无效的桌面设置"));
  }
  const write = pendingWrite.then(async () => {
    const next = { ...await readDesktopPreferences(), ...values };
    const directory = app.getPath("userData");
    const file = path.join(directory, "desktop-preferences.json");
    await mkdir(directory, { recursive: true });
    await writeFile(`${file}.tmp`, JSON.stringify(next, null, 2), "utf8");
    await rename(`${file}.tmp`, file);
    return next;
  });
  pendingWrite = write.catch(() => undefined);
  return write;
}

export function getLanAddresses(port: number, interfaces: Record<string, NetworkInterfaceInfo[] | undefined> = networkInterfaces()) {
  const seen = new Set<string>();
  return Object.entries(interfaces).flatMap(([name, entries]) => (entries ?? []).flatMap((entry) => {
    if (entry.family !== "IPv4" || entry.internal || entry.address.startsWith("169.254.") ||
      entry.address === "0.0.0.0" || seen.has(entry.address)) return [];
    seen.add(entry.address);
    return [{ name, url: `http://${entry.address}:${port}` }];
  }));
}
