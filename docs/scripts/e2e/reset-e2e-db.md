# E2E database reset script

`scripts/e2e/reset-e2e-db.mjs` drops and recreates the isolated e2e MySQL
schema (`nexhouse_e2e`), then re-grants privileges to the API user. Both the
api-e2e and web-e2e suites run it before every test run.

## Why a re-grant?

The script executes `DROP DATABASE nexhouse_e2e` (and `CREATE DATABASE`).
MySQL's `mysql.db` table stores per-schema grants, so dropping the schema also
removes the `pAdmin` grant for `nexhouse_e2e.*`. Without re-granting, the next
connection attempt fails with `Access denied for user 'pAdmin'`. The script
always re-runs:

```sql
GRANT ALL PRIVILEGES ON nexhouse_e2e.* TO 'pAdmin'@'%';
FLUSH PRIVILEGES;
```

## Connection details

Reads the same env the API uses in e2e mode (`.env.e2e`):

| Var | Local value | Purpose |
|---|---|---|
| `DB_HOST` | `localhost` | API's dev host is `127.0.0.1`, docker uses `db` |
| `DB_PORT` | `3307` | Host-side mapping of the docker MySQL 8 container (3306) |
| `DB_USER` | `pAdmin` | API user |
| `DB_PASSWORD` | `1234` | Credentials shared with `.env.e2e.example` |

## How the process is invoked

- `npm run e2e:db:reset` — standalone.
- `apps/api-e2e/src/support/global-setup.ts` — calls it via `execSync`.
- `apps/web-e2e/project.json` `e2e`/`e2e-ci` targets — run it before Playwright;
  `apps/web-e2e/src/support/global-setup.mjs` repeats it defensively (unless the
  e2e API is already connected) for direct `npx playwright test` invocations.

> Built with `execFileSync`, not a shell string, so the `.mjs` file and its args
> are never shell-interpreted.