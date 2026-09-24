# API e2e testing (jest + isolated schema)

End-to-end tests for `apps/api`, run against a **compiled** API (`dist/apps/api/main.js`)
isolated from the dev servers. The suite owns a dedicated MySQL schema
(`nexhouse_e2e`), resets it before every run, boots the API on a dedicated port
and does not touch the developer's `nx serve api` (port 3000).

## Commands

| Command | What it runs |
|---|---|
| `npm run e2e:db:reset` | Drops/recreates `nexhouse_e2e` and re-grants `pAdmin` (see `docs/scripts/e2e/reset-e2e-db.md`) |
| `npm run e2e:api` | `nx run api-e2e:e2e` (builds the API, resets the DB, boots it on port 3001, runs the jest suites) |
| `npm run e2e:web` | Playwright web suite (see `docs/web-e2e/testing.md`) |

Forward jest args with `--` (e.g. `npm run e2e:api -- --testPathPatterns=auth`).

## How it works

- `apps/api-e2e/jest.config.cts` uses `globalSetup` + `globalTeardown` and runs
  files serially (`maxWorkers: 1`) because the suites share one MySQL schema.
- `apps/api-e2e/src/support/global-setup.ts`:
  1. runs `scripts/e2e/reset-e2e-db.mjs`,
  2. spawns `node dist/apps/api/main.js` with `NX_E2E=1 NODE_ENV=test PORT=3001`
     (so `app.module.ts` loads `.env.e2e` instead of `.env`),
  3. polls until it can log in with the seeded super admin and immediately
     logout (routing + refresh-token path are both verified).
- `apps/api-e2e/src/support/global-teardown.ts` kills the API process (port 3001).
- `apps/api-e2e/src/support/test-setup.ts` points axios at `http://localhost:3001`,
  sets `validateStatus: status < 600` so error envelopes resolve and can be asserted.
- `apps/api-e2e/src/support/helpers.ts` provides the domain fixtures:
  `createNeighborhood`, `activateAdmin`, `createUnit`, `createResident`, catalog
  lookups, envelope assertions and unique-email/idempotency-key generators.

## Suite layout (`apps/api-e2e/src/api/`)

| Spec | Coverage |
|---|---|
| `smoke.spec.ts` | Health of the gateways (`/api/catalogs/countries`), update guards on read-only routes |
| `auth.spec.ts` | Login/refresh/logout flow, recovery (request → validate → reset) with weak/strong passwords, token expiry on users & neighborhoods |
| `catalogs.spec.ts` | Catalog GET routes listed in `docs/api/catalogs/controllers/catalogs.controller.md` |
| `user.spec.ts` | `/api/user/profile`, `/api/user/me`; `PATCH /api/user` and `/api/user/stats` are recorded as `it.todo` (known 500 for the isolated fixture) |
| `neighborhood.spec.ts` | Idempotency key requirement, atomic create (streets + admin), search, detail, and the latent `/api/neighborhood/mine` + `/api/neighborhood/streets` 500s for a super admin |
| `residents.spec.ts` | List, create (with own unit), duplicates (409), validation, and the super-admin scope guard behavior |
| `units.spec.ts` | List/create units as the scoped admin, validation, and the super-admin scope guard behavior |

Current status: **7 suites / 49 passed, 2 `it.todo`** (user endpoints).

## Documented latent bugs (asserted as current behavior)

- `NeighborhoodScopeGuard` (`_core/guards/neigh-scope.guard.ts`) reads
  `user.neighborhood.publicId` without a null check; a `super_admin` (no
  neighborhood) gets a **500**, not a 403. `residents` and `units` specs assert 500.
- `/api/neighborhood/mine`, `/api/neighborhood/streets`, `/api/user/stats` and
  `PATCH /api/user` return 500 for a super admin; specs document the current output.

These are intentionally exact-behavior assertions so the suite stays green while
the defects are open.

## References

- `docs/api/app/app.module.md` — `NX_E2E` env switch.
- `docs/scripts/e2e/reset-e2e-db.md` — isolated schema lifecycle.
- `AGENTS.md` → Commands / Known broken state.