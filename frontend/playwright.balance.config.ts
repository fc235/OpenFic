import { defineConfig } from "@playwright/test";
import base from "./playwright.history.config";
export default defineConfig({ ...base, testMatch: /deepseek-balance\.spec\.ts/ });
