import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: 'node server.js',
    url: `${baseURL}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
