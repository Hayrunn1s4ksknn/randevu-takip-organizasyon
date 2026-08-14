import fs from 'fs'
import path from 'path'
import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`

// E2E tests must never run against the production Supabase project. Next.js
// would otherwise fall back to .env.local (production credentials) for the
// `next build && next start` server this config spins up — loading
// .env.test.local here and passing it through webServer.env overrides that,
// since explicitly-set process env vars take precedence over .env files.
function loadTestEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '.env.test.local')
  if (!fs.existsSync(envPath)) {
    throw new Error(
      '.env.test.local bulunamadı. E2E testleri staging Supabase projesine karşı çalışmalı, ' +
        "production'a karşı değil — staging kimlik bilgilerini içeren bir .env.test.local oluşturun."
    )
  }
  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
      })
  )
}

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  fullyParallel: true,
  // This is a small suite (a handful of specs) sharing one local
  // `next start` process. Parallel workers cause real contention — server
  // responses slow down enough under concurrent load to blow past assertion
  // timeouts even though the mutation succeeds — without buying much wall
  // clock time back, so run serially for reliability.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: loadTestEnv(),
  },
})
