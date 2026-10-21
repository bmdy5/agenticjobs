import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  retries: 0,
  timeout: 15000,
  expect: { timeout: 3000 },
  reporter: [
    ['list'],
    ['junit', { outputFile: 'artifacts/login-junit.xml' }],
    ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }],
  ],
  outputDir: 'artifacts/test-results',
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4187',
    viewport: { width: 1100, height: 800 },
    screenshot: 'on',
    trace: 'on',
    video: 'on',
  },
  webServer: {
    command: 'node server.mjs',
    url: 'http://127.0.0.1:4187',
    timeout: 15000,
    reuseExistingServer: !process.env.CI,
  },
});
