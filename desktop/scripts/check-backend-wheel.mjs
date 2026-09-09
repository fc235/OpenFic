import { readdir } from "node:fs/promises";
import path from "node:path";
import { selectBundledOpenFicWheel } from "../dist/main/runtime/bundled-backend.js";

export default async function beforePack({ packager }) {
  const backendDir = path.resolve(packager.projectDir, "../backend/dist-desktop");
  const expectedVersion = packager.appInfo.version;
  let entries;
  try {
    entries = await readdir(backendDir, { withFileTypes: true });
  } catch (error) {
    throw new Error(`Cannot read OpenFic wheel directory: ${backendDir}. Run pnpm build:backend first.`, { cause: error });
  }
  // Match the formal extraResources filter; an sdist is not bundled.
  const wheels = entries
    .filter((entry) => entry.isFile() && entry.name.startsWith("openfic-") && entry.name.endsWith(".whl"))
    .map((entry) => entry.name);
  if (wheels.length !== 1) {
    throw new Error(`Expected exactly one OpenFic wheel in ${backendDir}; found ${wheels.length}: ${wheels.join(", ") || "none"}`);
  }
  if (!selectBundledOpenFicWheel(wheels, expectedVersion)) {
    throw new Error(`OpenFic wheel must match desktop version ${expectedVersion}; found ${wheels[0]}`);
  }
}
