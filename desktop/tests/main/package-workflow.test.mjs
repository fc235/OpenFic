import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const builderRequire = createRequire(require.resolve("electron-builder"));
const { load } = createRequire(builderRequire.resolve("app-builder-lib"))("js-yaml");
const config = load(await readFile(new URL("../../electron-builder.yml", import.meta.url), "utf8"));
const workflow = load(await readFile(new URL("../../../.github/workflows/package-build.yml", import.meta.url), "utf8"));

test("CI wheel download matches the verified resource directory", () => {
  const resources = config.extraResources.find((resource) => resource.to === "backend-dist");
  const download = workflow.jobs.desktop.steps.find((step) => step.with?.name === "backend-desktop-dist");
  const upload = workflow.jobs["build-python"].steps.find((step) => step.with?.name === "backend-desktop-dist");
  assert.equal(upload.with.path, `${download.with.path}/*.whl`);
  assert.ok(workflow.jobs["build-python"].steps.some((step) => step.run === "node desktop/scripts/build-backend.mjs"));
  assert.equal(path.posix.normalize(path.posix.join("desktop", resources.from)), download.with.path);
  const smoke = workflow.jobs.desktop.steps.find((step) => step.name === "Smoke test macOS runtime");
  assert.ok(smoke.run.includes(`${resources.from}/openfic-*.whl`));
});

test("desktop targets and artifact names support every CI platform and architecture", () => {
  for (const [platform, targets, suffix] of [["win", ["nsis", "zip"], "win"], ["mac", ["dmg", "zip"], "mac"], ["linux", ["AppImage", "tar.gz"], "linux"]]) {
    assert.deepEqual(config[platform].target, targets, `${platform} targets must allow the matrix architecture`);
    assert.equal(config[platform].artifactName, `OpenFic-\${version}-${suffix}-\${arch}.\${ext}`);
  }
  assert.equal(config.publish.owner, "fc235");
  assert.equal(config.publish.repo, "OpenFic");
  assert.ok(config.extraResources.some((resource) => resource.to === "app-update.yml"));
  assert.ok(config.beforePack);
});
