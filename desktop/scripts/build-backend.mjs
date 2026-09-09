import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Keep the desktop-only wheel separate from the full server/PyPI artifacts.
const child = spawn("uv", ["build", "--wheel", "--out-dir", "dist-desktop"], {
  cwd: fileURLToPath(new URL("../../backend", import.meta.url)),
  env: { ...process.env, OPENFIC_DESKTOP_BUILD: "1" },
  stdio: "inherit",
});
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
