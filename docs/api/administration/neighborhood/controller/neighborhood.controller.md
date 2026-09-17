# NeighborhoodController

Write/REST controller managing a neighborhood and its relational street catalog
inside a single ACID transaction.

- **File:** `apps/api/src/administration/neighborhood/controller/neighborhood.controller.ts`
- **Scope:** `neighborhood` module — registered in `NeighborhoodModule` alongside `NeighSearchController`.
- **Route prefix:** `/api/neighborhood` (global `api` prefix from main.ts).
- **Swagger tag:** `Neighborhood` (docs at `/api/docs`).

## Route map

| Route | Method | Controller method | Service call | HTTP |
|---|---|---|---|---|
| `/api/neighborhood` | `POST` | `create` | `NeighborhoodService.create(dto, user)` | `201` |
| `/api/neighborhood/:publicId` | `PATCH` | `update` | `NeighborhoodService.update(publicId, dto, user)` | `200` |

## Endpoint details

### `POST /api/neighborhood` — `create`

- Body: `CreateNeighborhoodDto` (`name`, `streets[]` with `name`, `adminEmail`,
  `zipCode`, `cityId`, `isActive`). Validated by class-validator → 400 on failure.
- `@UseInterceptors(IdempotencyInterceptor)`: requires the `X-Idempotency-Key`
  header (400 if missing). Replays already-completed responses and rejects
  in-flight duplicates with `409`.
- Service orchestrates a transactional creation: duplicate-name check (409 when
  taken) → neighborhood + address + streets + first admin resident, rolled back
  on any failure (wrapped as 500 unless already `Conflict`/`BadRequest`).
- Returns the created `Neighborhood` (with `streets` and `address.city`).

### `PATCH /api/neighborhood/:publicId` — `update`

- `publicId` validated with `ParseUUIDPipe` → 400 for non-UUID.
- Body: `UpdateNeighborhoodDto` (`name?`, `streets?` with optional per-street
  `publicId`, `isActive?`).
- Same idempotency interceptor as `create`.
- Service runs a transaction: name uniqueness check (409), then street diffing —
  missing `publicId` → create, matched `publicId` → update, existing streets not
  present in the DTO → remove. Unknown street `publicId` → 400.
- `404` when the neighborhood does not exist; returns the updated `Neighborhood`.

## Swagger

- `POST` documents `201 / 400 / 409`; `PATCH` documents `200 / 400 / 404 / 409`.

## Test coverage

- `apps/api/src/administration/neighborhood/controller/neighborhood.controller.spec.ts`
- Covers: controller instantiation with mocked services + `CACHE_MANAGER` /
  `Reflector` (required by the idempotency interceptor's DI); delegation of
  `create` (payload + actor forwarded, created record returned) and `update`
  (public ID + payload + actor forwarded, updated record returned).