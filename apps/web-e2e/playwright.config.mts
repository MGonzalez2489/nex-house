import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// Playwright config must be a .mts file so Node forces ESM regardless of the
// workspace `type` (Playwright routes .mts through its ESM loader).
//
// The suite runs an isolated stack:
//   - API: built bundle (`dist/apps/api/main.js`, depends on `api:build`) on
//     PORT 3001 with `NX_E2E=1 NODE_ENV=test` (.env.e2e, nexhouse_e2e schema).
//   - Web: Angular dev-server on PORT 4288 proxying /api, /uploads and
//     /socket.io to the e2e API via `API_PROXY_URL` (apps/web/proxy.config.js).
//
// The `e2e` target in project.json runs `npm run e2e:db:reset` before Playwright
// so the schema always exists before the servers boot; globalSetUp is defensive.
const baseURL =
  process.env['BASE_URL'] || `http://localhost:${process.env['WEB_E2E_PORT'] || '4288'}`;
const apiURL = `http://localhost:${process.env['API_E2E_PORT'] || '3001'}`;

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  globalSetup: `${import.meta.dirname}/src/support/global-setup.mjs`,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  /* Start the API and the web dev server before running the tests. */
  webServer: [
    {
      command: 'NODE_ENV=test NX_E2E=1 PORT=3001 node dist/apps/api/main.js',
      url: `${apiURL}/api/catalogs/countries`,
      cwd: workspaceRoot,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'node apps/web-e2e/support/static-server.mjs',
      url: 'http://localhost:4288',
      cwd: workspaceRoot,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
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
});