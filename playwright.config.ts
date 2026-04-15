import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://localhost:4173",
    screenshot: "on",
    trace: "retain-on-failure",
    permissions: ["clipboard-write", "clipboard-read"],
  },
  webServer: {
    command: "yarn preview --port 4173",
    port: 4173,
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
