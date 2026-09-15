import { readdir } from "node:fs/promises";
import path from "node:path";
import { toPythonPackageVersion } from "./package-version.js";

export function selectBundledOpenFicWheel(fileNames: string[], expectedVersion: string): string | null {
  const normalizedVersion = toPythonPackageVersion(expectedVersion).replace(/-/g, "_");
  const prefix = `openfic-${normalizedVersion}-`;
  const matches = fileNames.filter((name) => {
    const normalizedName = name.toLowerCase();
    return normalizedName.startsWith(prefix) && normalizedName.endsWith(".whl");
  });
  if (matches.length > 1) {
    throw new Error(`找到多个 OpenFic ${expectedVersion} 后端包：${matches.join(", ")}`);
  }
  return matches[0] ?? null;
}

export async function resolveBundledOpenFicWheel(
  resourcesPath: string,
  expectedVersion: string,
  required: boolean,
): Promise<string | null> {
  const backendDir = path.join(resourcesPath, "backend-dist");
  let fileNames: string[];
  try {
    fileNames = await readdir(backendDir);
  } catch (error) {
    if (!required && (error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(`无法读取内置后端目录：${backendDir}`, { cause: error });
  }
  const wheelName = selectBundledOpenFicWheel(fileNames, expectedVersion);
  if (wheelName) return path.join(backendDir, wheelName);
  if (!required) return null;
  throw new Error(`未找到 OpenFic ${expectedVersion} 后端包：${backendDir}`);
}
