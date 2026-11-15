import { defineConfig, devices } from "@playwright/test";

// E2E runs against the dev stack (docker compose up). In the Playwright container, localhost is mapped to the host
// so the browser reaches the published ports (web 3101, api 3100).
const mapLocalhost = process.env.E2E_MAP_LOCALHOST_TO;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  workers: 1,
  // On GitHub Actions, failures also become annotations on the run (readable through the API without signing in).
  reporter: process.env.GITHUB_ACTIONS ? [["list"], ["github"]] : [["list"]],
  // CI machines are slower and the dev server compiles pages on first visit: allow one retry there.
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3101",
    trace: "retain-on-failure",
    launchOptions: mapLocalhost ? { args: [`--host-resolver-rules=MAP localhost ${mapLocalhost}`] } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
