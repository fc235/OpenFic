import assert from "node:assert/strict";
import test from "node:test";
import { matchesOpenFicVersion, toPythonPackageVersion } from "../../dist/main/runtime/package-version.js";

test("normalizes prerelease formats while keeping release stages and numbers distinct", () => {
  for (const [desktop, python] of [
    ["1.0.4-beta", "1.0.4b0"],
    ["1.0.4-beta.2", "1.0.4b2"],
    ["1.0.4-alpha.1", "1.0.4a1"],
    ["1.0.4-rc.1", "1.0.4rc1"],
    ["1.0.4", "1.0.4"],
  ]) {
    assert.equal(toPythonPackageVersion(desktop), python);
    assert.equal(matchesOpenFicVersion(python, desktop), true);
  }
  assert.equal(matchesOpenFicVersion(null, "1.0.4-beta"), false);
  assert.equal(matchesOpenFicVersion("1.0.4b1", "1.0.4-beta"), false);
  assert.equal(matchesOpenFicVersion("1.0.4b0", "1.0.4"), false);
  assert.equal(matchesOpenFicVersion("1.0.4", "1.0.4-beta"), false);
  assert.equal(matchesOpenFicVersion("1.0.3", "1.0.4-beta"), false);
});
