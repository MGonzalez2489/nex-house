# AGENTS.md

## Repo layout
NX monorepo. Two apps, one shared lib.
- `apps/api` — NestJS + TypeORM + MySQL backend, global prefix `api`, Swagger at `/api/docs`.
- `apps/web` — Angular 21 + PrimeNG + Tailwind v4 (standalone components, signals). Dev server proxies `/api`, `/uploads`, `/socket.io` to `localhost:3000` (`apps/web/proxy.config.js`).
- `libs/shared-domain` — shared contracts only; import via `@nexhouse/shared-domain/{enums,interfaces,models,utils}` (aliases in `tsconfig.base.json`). Reuse these instead of duplicating types across apps.
- API app-local path aliases live in `apps/api/tsconfig.app.json`: `@core/*` → `src/_core/*`, plus `@auth/*`, `@administration/*`, `@catalogs/*`.

## Commands
- `nx serve api` / `nx serve web` — dev servers
- `nx test api`, `nx test web`, `nx test shared-domain` — unit tests
- `npm run test-api:cov` — `nx test api --coverage`
- `nx lint api`, `nx lint web` — lint; root `npm run lint` lints everything
- `nx e2e api-e2e` (jest) / `nx e2e web-e2e` (playwright)
- No typecheck script or config exists in the repo.
- Husky: `commit-msg` enforces conventional commits; `pre-commit` runs `nx affected --target=lint`.

## Known broken state
`nx test api` currently does not pass: `@catalogs/*` is missing from the path aliases in `apps/api/tsconfig.spec.json` (it exists only in `tsconfig.app.json`), so any spec importing from `@catalogs/services` fails to compile (e.g. `unit.service.spec.ts`).

## Database & entities (no migrations)
- `synchronize: true` in `apps/api/src/_core/database/data-source.ts` — schema auto-creates/updates from entities on boot. There are no migration files.
- Entities are registered via `Object.values(Entities)` from `apps/api/src/_core/database/entities/index.ts`. **You MUST add new entities to that index file or their tables won't be created.**
- Entity conventions (see `.ai/skills/backend/create-entity.md` and `.ai/rules/database.md`):
  - Entities live in `apps/api/src/_core/database/entities/`, grouped by domain (`administration/`, `catalogs/`, `finance/`).
  - Extend `BaseCatalog` (catalogs) or `BaseTraceableEntity` (business/audited) from `_base/`; never plain `BaseEntity` directly.
  - `@Entity('plural_snake_case')`, camelCase TS props mapped with `@Column({ name: 'snake_case' })`, FK join columns use camelCase name (e.g. `@JoinColumn({ name: 'cityId' })`).
  - Location hierarchy is zero-redundancy: `NeighborhoodAddress` references `city_id` only — never store `state_id`/`country_id` in address tables. GPS coordinates are `decimal(10, 7)`.
- A `DatabaseSeederService` runs on app bootstrap: seeds catalog tables (in `_core/database/seeds/`), the location seed (Mexico/Chihuahua), and a super admin from env (`SUPER_ADMIN_USER`/`SUPER_ADMIN_PWD`). New catalogs need a seed file + registration in `seeder.service.ts`'s `CatalogRegistry`.

## Env & Docker
- Root `.env` is gitignored but required by the API (`ConfigModule` uses `envFilePath: '.env'`). Committed `.dev.env` is the empty-credentials template — copy it to `.env` and fill in.
- `docker compose up --build -d` runs `db` (MySQL 8), `api`, `web`. Host DB port is `DB_PORT` (3307 in `.env`), mapped to 3306 in the container. `data-source` reads `DB_HOST` (127.0.0.1 locally, `db` in docker).
- Uploads: `UPLOAD_DIR` (default `uploads`). `getUploadsFolderPath` resolves it as an absolute path or relative to `process.cwd()` (repo root) — dev files land in `<root>/uploads` (gitignored) so they don't trigger the `nx serve api` rebuild; Docker resolves it to `/app/uploads` (mounted volume). Never point it inside `apps/api` or every upload will rebuild the API.

## Commits
Conventional Commits is enforced by a husky hook: `type(scope): lowercase imperative description`, no trailing period. Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore` (see `.ai/rules/git-commits.md`).