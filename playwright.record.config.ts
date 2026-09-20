import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://127.0.0.1:${PORT}`;
const artifactsDir = process.env.ARTIFACTS_DIR ?? '/run-output';

export default defineConfig({
  testDir: 'journeys',
  testMatch: '**/*.journey.ts',
  outputDir: `${artifactsDir}/journey`,
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'node server.js',
    url: `${baseURL}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
