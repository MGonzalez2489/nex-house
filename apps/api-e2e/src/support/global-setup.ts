import { execSync, spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import axios from 'axios';

declare global {
  var __TEARDOWN_MESSAGE__: string;
}

const E2E_PORT = process.env.PORT ?? '3001';
const BASE_URL = `http://localhost:${E2E_PORT}`;
const API_ENTRY = resolve(process.cwd(), 'dist/apps/api/main.js');
const DB_RESET_SCRIPT = resolve(process.cwd(), 'scripts/e2e/reset-e2e-db.mjs');

module.exports = async function () {
  console.log('\n[api-e2e] Setting up...\n');

  resetDatabase();
  await spawnApiServer();
  await waitForApiReady();

  globalThis.__TEARDOWN_MESSAGE__ = '\n[api-e2e] Tearing down...\n';
};

/** Drops and recreates the isolated `nexhouse_e2e` schema. */
function resetDatabase(): void {
  execSync(`node "${DB_RESET_SCRIPT}"`, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}

/** Boots the compiled API against the e2e database on the e2e port. */
async function spawnApiServer(): Promise<void> {
  if (!existsSync(API_ENTRY)) {
    throw new Error(
      `[api-e2e] API build not found at ${API_ENTRY}. ` +
        `'nx run api-e2e:e2e' depends on api:build, so run it via nx (or run 'nx build api' first).`,
    );
  }

  const child: ChildProcess = spawn('node', [API_ENTRY], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NX_E2E: '1',
      NODE_ENV: 'test',
      PORT: E2E_PORT,
    },
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    console.log(`[api-e2e] API process exited with code ${code}`);
  });
}

/**
 * Polls the API until it answers a login probe, meaning the HTTP server is up
 * *and* the catalog/location/super-admin seeding has finished.
 */
async function waitForApiReady(timeoutMs = 120000): Promise<void> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {
          email: process.env.SUPER_ADMIN_USER ?? 'root@test.com',
          password: process.env.SUPER_ADMIN_PWD ?? '1234',
        },
        { timeout: 4000, validateStatus: () => true },
      );

      if (res.status >= 200 && res.status < 500) {
        console.log(
          `[api-e2e] API ready at ${BASE_URL} (login probe -> ${res.status}).`,
        );
        // Dispose the probe session so it does not linger in the sessions table.
        const token = res.data?.data?.token;
        if (token) {
          await axios.post(
            `${BASE_URL}/api/auth/logout`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 4000,
              validateStatus: () => true,
            },
          );
        }
        return;
      }
    } catch {
      // not up yet — keep polling
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  throw new Error(
    `[api-e2e] API did not become ready at ${BASE_URL} within ${timeoutMs}ms.`,
  );
}