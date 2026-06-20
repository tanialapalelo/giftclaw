import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests/e2e",

  // run tests in files in parallel, so quick feedback on CI
  fullyParallel: true,

  // if 1 test fails, fail the whole CI run, save time and resources
  forbidOnly: !!process.env.CI,

  // retry once for network flakiness in CI — retry before declaring fail
  retries: process.env.CI ? 1 : 0,

  // 1 local worker in local, 50% CPU in CI
  workers: process.env.CI ? "50%" : 1,

  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",

    // save trace if test fail, so we can replay for debugging, but only for retry to save disk space
    trace: "on-first-retry",
  },

  projects: [
    // now only test against desktop Chrome, but we can add more browsers and devices later
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // auto start nexjs dev server before test, so no manual run from terminal needed,
  // timeout 2 mins for server to be ready, and reuse existing server in local for faster feedback loop
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
