/** Electron uses SemVer; Python wheel metadata uses PEP 440. */
export function toPythonPackageVersion(version: string): string {
  return version.trim().toLowerCase().replace(
    /^(\d+\.\d+\.\d+)-(alpha|beta|rc)(?:\.(\d+))?$/,
    (_match, base: string, stage: string, sequence: string | undefined) => {
      const suffix = stage === "alpha" ? "a" : stage === "beta" ? "b" : "rc";
      return `${base}${suffix}${sequence ?? "0"}`;
    },
  );
}

export function matchesOpenFicVersion(actual: string | null, expected: string): boolean {
  return actual !== null && toPythonPackageVersion(actual) === toPythonPackageVersion(expected);
}
