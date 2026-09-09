import process from "node:process";

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /task-history.*\.spec\.ts/,
  workers: 1,
  timeout: 30000,
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL,
    viewport: { width: 1200, height: 900 },
  },
  webServer: {
    command: "pnpm exec vp dev --host 127.0.0.1 --port 5175",
    url: "http://127.0.0.1:5175",
    reuseExistingServer: !process.env.CI,
  },
});
