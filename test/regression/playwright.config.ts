import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  tsconfig: "./tsconfig.json",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "html",
  timeout: 300_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    launchOptions: {
      slowMo: 500,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
