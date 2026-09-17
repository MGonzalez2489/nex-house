# DatabaseSeederService

`apps/api/src/_core/database/seeder.service.ts`

Seeds the database once the application finishes bootstrapping (`OnApplicationBootstrap`). It is **idempotent** (safe to run on every boot and after a partial seed) and **fail-safe** (each routine isolates its own errors so a broken step never blocks the app from starting).

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<User>` | Super admin existence check and creation |
| `Repository<Country>` / `Repository<State>` / `Repository<City>` | Location hierarchy seeding |
| `EntityManager` | Generic repository access for the catalog registry and super admin role/status resolution |
| `ConfigService` | Reads `SUPER_ADMIN_USER` / `SUPER_ADMIN_PWD` |
| `CryptoService` | Hashes the super admin password |

## Bootstrap flow

`onApplicationBootstrap()`:

1. `seedAllCatalogs()` — all catalog tables in parallel.
2. `Promise.all([runLocationSeed(), seedSuperAdmin()])` — the location hierarchy is independent and runs alongside the super admin seed.

Catalogs run first because the super admin resolves its `SUPERADMIN` role and `ACTIVE` status from them. No routine ever throws.

## Catalog seeding

The catalog registry is a declarative `CatalogSeedDefinition[]` (`name`, `entity`, `data`) covering:

`ChargeStatus`, `FeeStatus`, `PaymentStatus`, `TransactionSource`, `TransactionType`, `UnitStatus`, `UnitType`, `UserRole`, `UserStatus`, `UserUnitRole`.

`seedCatalog(definition)`:

1. Loads the existing `name` values in a **single** query.
2. Computes the missing set.
3. Persists the missing records in a **single** `save`.

This replaces the previous `count === 0` guard, which could not repair partially seeded catalogs. Errors are logged with the entity name and stack, then swallowed so the remaining catalogs still run.

## Location seeding

`runLocationSeed()`:

1. `seedCountries()` — inserts only the missing countries (by `code`).
2. Loads Mexico (`MX`); if missing, logs an error and stops.
3. `seedStates(countryId)` — inserts only the states whose `code` is absent.
4. Loads Chihuahua (`CHH`); if missing, logs an error and stops.
5. `seedCities(stateId)` — inserts only the cities whose `name` is absent.

All reads load the existing keys up-front (one query per level) and write the missing records in one `save`. The whole routine is wrapped in a try/catch that logs the failure.

## Super admin seeding

`seedSuperAdmin()`:

1. Reads `SUPER_ADMIN_USER` and `SUPER_ADMIN_PWD`; when either is missing it logs a warning and skips (previously it created an account with empty credentials).
2. Normalizes the email (`trim().toLowerCase()`).
3. Skips when the account already exists.
4. Resolves `UserRole` (`SUPERADMIN`) and `UserStatus` (`ACTIVE`) **by name** instead of hard-coded primary keys. If either is missing it logs an error and aborts.
5. Hashes the password and creates the user with its nested `profile` (cascade).
6. Errors are logged and swallowed.

## Improvements (this revision)

- **Idempotent per-record seeding** for catalogs, states and cities; the old `countryRepository.count() > 0` early return meant missing states/cities were never repaired.
- **Super admin resolved by catalog name** (`UserRoleEnum.SUPERADMIN` / `UserStatusEnum.ACTIVE`) instead of `roleId: 1` / `statusId: 1`.
- **Env validation**: empty `SUPER_ADMIN_USER` / `SUPER_ADMIN_PWD` no longer produce a broken account.
- **Typed registry**: replaced the misleading `(entity as Partial<BaseCatalog>).name` cast with an explicit `name` field.
- **Parallelized** catalog seeding and location/super-admin seeding.
- **Consistent error logging** with stack traces and no emojis; removed hard-coded magic constants by adding `MEXICO_COUNTRY_CODE` / `CHIHUAHUA_STATE_CODE`.
