import { toPythonPackageVersion } from "./package-version.js";

interface SpawnCommand {
  command: string;
  args: string[];
}

export function resolveOpenFicCliPath(venvPythonPath: string): string {
  return process.platform === "win32"
    ? venvPythonPath.replace(/python\.exe$/i, "openfic.exe")
    : venvPythonPath.replace(/python$/i, "openfic");
}
export function createOpenFicVersionCommand(venvPythonPath: string): SpawnCommand {
  return {
    command: venvPythonPath,
    args: ["-c", 'from importlib.metadata import version; print(version("openfic"))'],
  };
}

export function createOpenFicInstallCommand(
  venvPythonPath: string,
  version: string,
  forceReinstall = false,
  wheelPath?: string,
): Omit<SpawnCommand, "command"> {
  const installTarget = wheelPath ?? `openfic==${toPythonPackageVersion(version)}`;
  return {
    args: ["pip", "install", "--python", venvPythonPath, ...(forceReinstall ? ["--reinstall"] : []), installTarget],
  };
}

export function createOpenFicServeCommand(venvPythonPath: string, port: number, host = "127.0.0.1"): SpawnCommand {
  return {
    command: resolveOpenFicCliPath(venvPythonPath),
    args: ["serve", "--host", host, "--port", String(port)],
  };
}
