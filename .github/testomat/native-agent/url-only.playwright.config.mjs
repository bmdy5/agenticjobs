import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: 'url-only-regression.spec.ts', workers: 1, retries: 0,
  reporter: [['list'],['junit',{outputFile:'../../../native-evidence/retest.xml'}],['@testomatio/reporter/lib/adapter/playwright.js']],
  use: {headless:true, launchOptions: {executablePath: process.env.TRIAL_CHROMIUM_PATH}, screenshot:'only-on-failure', trace:'retain-on-failure'},
});
