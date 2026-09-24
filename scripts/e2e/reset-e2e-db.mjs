#!/usr/bin/env node
/**
 * Drops and recreates the isolated e2e MySQL schema (`nexhouse_e2e` by
 * default) inside the docker `db` container.
 *
 * Invoked at the start of every e2e run (api-e2e jest globalSetup and web-e2e
 * Playwright globalSetup) so the suite always starts from a clean slate. The
 * API bootstraps the schema via `synchronize: true` + the seeder.
 *
 * Env overrides:
 * - DB_NAME             e2e schema name (default `nexhouse_e2e`)
 * - DB_ROOT_PASSWORD    mysql root password (default `1234`)
 * - DB_CONTAINER        docker container name (default `db`)
 */
import { execFileSync } from 'node:child_process';

const schema = process.env.DB_NAME || 'nexhouse_e2e';
const rootPwd = process.env.DB_ROOT_PASSWORD || '1234';
const container = process.env.DB_CONTAINER || 'db';
// User granted on the fresh schema. Dropping a database deletes its mysql.db
// grant rows, so they must be re-created after the DROP.
const dbUser = process.env.DB_USER || 'pAdmin';

const statement = [
  `DROP DATABASE IF EXISTS \`${schema}\``,
  `CREATE DATABASE \`${schema}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  `GRANT ALL PRIVILEGES ON \`${schema}\`.* TO '${dbUser}'@'%'`,
  'FLUSH PRIVILEGES',
].join('; ');

try {
  // execFileSync passes args verbatim (no shell), so the backticks around the
  // schema name and the `-e` statement stay literal.
  execFileSync('docker', ['exec', container, 'mysql', '-uroot', `-p${rootPwd}`, '-e', statement], {
    stdio: 'inherit',
  });
  console.log(`[e2e] Database \`${schema}\` reset successfully.`);
} catch (error) {
  console.error(
    `[e2e] Failed to reset database \`${schema}\` on container \`${container}\`.`,
  );
  console.error(
    'Is docker running and the `db` container up? (docker compose up --build -d)',
  );
  throw error;
}