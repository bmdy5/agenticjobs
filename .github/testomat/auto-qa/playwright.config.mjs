import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig({testDir:'.',outputDir:path.join(here,'test-results'),testMatch:'regression.spec.ts',workers:1,retries:0,reporter:[['list'],['junit',{outputFile:path.join(here,'evidence/result.xml')}],['@testomatio/reporter/lib/adapter/playwright.js']],use:{headless:true,launchOptions:{executablePath:process.env.TRIAL_CHROMIUM_PATH},screenshot:'only-on-failure',trace:'retain-on-failure'}});
