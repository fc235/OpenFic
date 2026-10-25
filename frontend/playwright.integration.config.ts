import process from "node:process";

import { defineConfig } from "@playwright/test";

import config from "./playwright.history.config";
export default defineConfig({
  ...config,
  testMatch: [
    "task-history*.spec.ts",
    "model-click.spec.ts",
    "settings-*.spec.ts",
    "desktop-settings.spec.ts",
    "deepseek-balance.spec.ts",
    "editor-usability.spec.ts",
    "project-references.spec.ts",
    "autosave.spec.ts",
    "upstream-theme.spec.ts",
    "dashboard-timezone.spec.ts",
  ],
  use: { ...config.use, baseURL: "http://127.0.0.1:5175", channel: process.env.PLAYWRIGHT_CHANNEL },
});
