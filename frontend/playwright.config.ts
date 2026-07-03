import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests. Prereqs before `npm run e2e`:
 *   1. Backend up on :8000  (docker-compose up -d && uvicorn main:app --reload)
 *      — needs Postgres + .env, so we do NOT auto-start it here.
 *   2. Frontend on :5173    — auto-started below (reuseExistingServer if already up).
 *
 * Auth: the `setup` project hits POST /auth/dev-login (the bot-login bypass,
 * dev-only) once and saves the session cookie to playwright/.auth/user.json.
 * The `chromium` project loads it, so specs start already logged in.
 * Guest specs opt out with test.use({ storageState: { cookies: [], origins: [] } }).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
})
