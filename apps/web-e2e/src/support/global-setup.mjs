import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { createConnection } from 'node:net';

const API_E2E_PORT = Number(process.env['API_E2E_PORT'] || '3001');

const isPortOpen = (port) =>
  new Promise((resolve) => {
    const socket = createConnection({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });

/**
 * The `e2e` nx target already runs `npm run e2e:db:reset` before Playwright, so
 * the `nexhouse_e2e` schema exists before either webServer boots. When the
 * config is run directly (e.g. `npx playwright test`), reset the database here
 * IF the e2e API is not yet listening (dropping a live schema would break the
 * running server's connections).
 */
export default async function globalSetup() {
  if (await isPortOpen(API_E2E_PORT)) {
    console.log('[web-e2e] API already running, skipping DB reset.');
    return;
  }
  console.log('[web-e2e] Resetting e2e database...');
  execFileSync(process.execPath, ['scripts/e2e/reset-e2e-db.mjs'], {
    cwd: join(import.meta.dirname, '..', '..', '..', '..'),
    stdio: 'inherit',
  });
}