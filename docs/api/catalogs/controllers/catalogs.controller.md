# CatalogsController

Read-only REST controller exposing the registered catalog tables (systematic
enum-backed codes) and the location hierarchy (countries → states → cities). All
routes are cached in memory for 24 hours.

- **File:** `apps/api/src/catalogs/controllers/catalogs.controller.ts`
- **Scope:** `catalogs` module — registered in `CatalogsModule`.
- **Route prefix:** `/api/catalogs` (global `api` prefix from main.ts).
- **Swagger tag:** `Catalogs` (docs at `/api/docs`).

## Route map (all `GET`, all `200`)

| Route | Method | Entity / filter | Purpose |
|---|---|---|---|
| `user_roles` | `findUserRoles` | `UserRole`, `where { name: Not(SUPERADMIN) }` | Excludes the system root role |
| `user_statuses` | `findUserStatuses` | `UserStatus` | Profile statuses |
| `user_unit_roles` | `findUserUnitRoles` | `UserUnitRole` | User ↔ unit relation roles |
| `unit_statuses` | `findUnitStatuses` | `UnitStatus` | Property/operational states |
| `unit_types` | `findUnitTypes` | `UnitType` | Housing layout schemas |
| `transaction_sources` | `findTransactionSources` | `TransactionSource` | Ledger origin vectors |
| `transaction_types` | `findTransactionTypes` | `TransactionType` | Ledger classification |
| `payment_statuses` | `findPaymentStatuses` | `PaymentStatus` | Invoice payment states |
| `fee_statuses` | `findFeeStatuses` | `FeeStatus` | Maintenance-fee states |
| `charge_statuses` | `findChargeStatuses` | `ChargeStatus` | Debt/charge lifecycles |
| `countries` | `findCountries` | `Country` | Full country list |
| `states/:countryId` | `findStatesByCountryId` | `State where countryId` | States of a country |
| `cities/:stateId` | `findCitiesByStateId` | `City where stateId` | Cities of a state |

## Cross-cutting behavior

- **Class-level `CacheInterceptor`** (`@UseInterceptors`): every response is
  cached by URL for **24 hours** (`ONE_DAY_IN_SECONDS = 60 * 60 * 24` TTL). Cache
  is in-memory via `CacheModule`/`CACHE_MANAGER`.
- `@HttpCode(HttpStatus.OK)` (default for `GET`, kept explicit).
- `UserRoleEnum.SUPERADMIN` is excluded server-side from `user_roles` so the
  system root role is never exposed to clients.
- Return types are the **concrete entity types** (`UserRole[]`, `City[]`, ...),
  not a generic catalog type.

## Location endpoints

- `findStatesByCountryId` / `findCitiesByStateId` accept a **public UUID**
  (`ParseUUIDPipe` — non-UUID input → 400):
  1. `service.findByPublicId(Country|State, publicId)` resolves the parent.
  2. `service.findAll(..., { where: { countryId | stateId: parent.id } })`
     returns the children.
- Missing parent → the service throws `NotFoundException` (404) and the children
  query never runs. Documented with `@ApiResponse(404)`.

## Notes / cleanup vs. previous implementation

- The `@CacheTTL(60 * 60 * 24)` literal was repeated 13 times → hoisted to the
  `ONE_DAY_IN_SECONDS` module constant.
- `findUnitType` was renamed to **`findUnitTypes`** (plural) to match the
  `unit_types` route and its sibling handlers; no callers outside the module.
- Removed the stray `/////////////////////` separator comment and added `404`
  Swagger responses to the two parameterized endpoints.

## Test coverage

- `apps/api/src/catalogs/controllers/catalogs.controller.spec.ts` (15 cases)
- Covers: `findUserRoles` SUPERADMIN exclusion; every plain catalog endpoint
  (`describe.each`) asserting the queried entity; `findCountries`; the two
  location endpoints (parent resolution + children `where` filter); and
  `NotFoundException` propagation without touching the children query.