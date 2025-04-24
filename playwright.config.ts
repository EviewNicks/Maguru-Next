import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

// Memuat environment variables dari .env.test
dotenv.config({ path: '.env.test' })
/**
 * Konfigurasi Playwright untuk E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.spec.ts',
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maksimum waktu tunggu untuk assertions
     * @see https://playwright.dev/docs/test-assertions
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. */
  reporter: [
    ['html', { outputFolder: './services/playwright-report' }],
    ['json', { outputFile: './services/playwright-report/test-results.json' }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
