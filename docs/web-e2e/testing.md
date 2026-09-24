# Web e2e testing (Playwright)

Browser end-to-end tests in `apps/web-e2e` that drive the real Angular app
served over HTTP against the isolated e2e API (`port 3001`), resetting the
`nexhouse_e2e` database before every run.

## Commands

| Command | What it runs |
|---|---|
| `npm run e2e:web` | `nx run web-e2e:e2e` — builds the API and the web app (development), resets the DB, boots both servers, runs Playwright over the 3 browser projects |
| `nx run web-e2e:e2e-ci` | Same suite, non-parallel-safe alias for CI use |

`apps/web-e2e/project.json` overrides the inferred Playwright targets: the `e2e`
target depends on `api:build` and `web:build:development` and runs
`npm run e2e:db:reset` before Playwright so the schema always exists before the
servers boot. The inferred `e2e-ci--*` atomized targets are shadowed.

## Architecture

Playwright (`playwright.config.mts`) starts two web servers and runs each spec
against all three browser projects (chromium, firefox, webkit):

1. **API**: `NODE_ENV=test NX_E2E=1 PORT=3001 node dist/apps/api/main.js`
   (readiness probe: `GET /api/catalogs/countries` — 401/200 both mean ready).
2. **Web**: `node apps/web-e2e/support/static-server.mjs` serving the built app
   from `dist/apps/web/browser` on port **4288**, proxying `/api`, `/public`,
   `/uploads` and `/socket.io` to the e2e API (same behavior as
   `apps/web/proxy.config.js`).

### Why a static server instead of `nx run web:serve`?

`nx run web:serve --port=4288` launches the same Nx task
(`web:serve:development`) that the developer's `nx serve web` holds. Nx waits
on that lock forever, so a second dev-server instance cannot start in parallel
with the running development stack. Serving the build avoids the lock, the
long dev-server compile, and keeps the suite deterministic.

## Support code

- `apps/web-e2e/src/support/global-setup.mjs` — defensive DB reset. The nx
  target already resets the DB; if run directly (`npx playwright test`) it
  resets again **unless** the e2e API is already listening (dropping a live
  schema would break the running server's connections).
- `apps/web-e2e/src/support/api.ts` — `fetch`-based API helpers (seeded super
  admin login, catalog lookups, `createDisposableAdmin`) used to seed fixtures
  before exercising the UI.
- `apps/web-e2e/src/fixtures.ts` — `test.extend` fixture `loginAs`
  (fills the prefilled login form and waits for `/dashboard`), `createAdmin`
  and `apiToken`.

## Specs (`apps/web-e2e/src/`)

| Spec | Coverage |
|---|---|
| `auth.spec.ts` | Login page renders + is prefilled (`root@test.com` / `1234`), wrong credentials show the error inline, valid login lands on `/dashboard` |
| `recovery.spec.ts` | Full forgotten-password flow with a disposable admin: request → validate (code auto-fills from the store) → set strong password → automatic login into `/dashboard` |
| `navigation.spec.ts` | Role-based layouts/menus and the `AccessGuard` redirect (`/residents` → `/unauthorized` for a super admin) |
| `neighborhoods.spec.ts` | Super-admin list page and navigation to the create form |
| `profile.spec.ts` | `/profile` page renders for a logged-in user |

Current status: **10 specs × 3 browsers = 30 passed**.

Selectors are DOM-based (labels, `#password input`, `p-message`) on purpose:
PrimeNG wrapped inputs must be queried via their inner `<input>`.

## References

- `docs/api-e2e/testing.md` — shared infra (schema, ports, env).
- `docs/web/proxy.config.md` — the dev proxy the static server mirrors.
- `AGENTS.md` → Commands.