import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',testMatch:'**/*.spec.ts',fullyParallel:false,workers:1,retries:0,
  reporter:process.env.CI?'github':'list',timeout:30000,globalTimeout:180000,
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{command:'node --import tsx tests/browser/server.ts',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:30000},
});
