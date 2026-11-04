import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    {
      command: 'cd server && npx tsx src/index.ts',
      port: 3001,
      reuseExistingServer: true,
    },
    {
      command: 'cd client && npx vite --port 5173',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});
