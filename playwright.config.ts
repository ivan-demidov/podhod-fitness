import { defineConfig, devices } from '@playwright/test'

const base = process.env.PODHOD_BASE || '/'
export default defineConfig({
  testDir: 'tests',
  timeout: 30000,
  fullyParallel: true,
  use: { baseURL: process.env.PODHOD_TEST_URL || 'http://127.0.0.1:4173' + base, trace: 'retain-on-failure' },
  ...(process.env.PODHOD_TEST_URL ? {} : {
    webServer: {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173' + base,
      reuseExistingServer: true,
    },
  }),
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 15 Pro'] } },
  ],
})
