# ResidentStore (web)

`@ngrx/signals` feature store that owns the resident listing, statistics,
creation and update flow for a neighborhood.

- **File:** `apps/web/src/app/features/residents/resident.store.ts`
- **Injected with:** `withDevtools('residents')`, `withReset()`, `withEntities`,
  `withCallState()`.
- **Consumed by:** `resident-home-page`, `resident-form-page`.

## State

| Field | Type | Description |
|---|---|---|
| `entities()` | `UserModel[]` | Loaded residents (CollectionState), keyed by `publicId` |
| `pagination()` | `ApiPaginationMeta \| undefined` | `GET /` response meta (`total`, `page`, `lastPage`, `limit`) |
| `stats()` | `UserStats \| undefined` | Aggregated role/status counts from `GET /stats` |
| `loading()` / `loaded()` / `error()` | `CallState` | `withCallState` lifecycle signals |

Entity id selector: `user.publicId`.

## Methods

### `loadStats(): void`

`rxMethod<void>` — sets `loading()`, calls `ResidentService.getStats(neighborhoodId)`
and stores `response.data` as `stats`. Errors patch `setError`. If the current
`ContextStore.neighborhood()` is missing the request is skipped silently.

### `loadAll(params: SearchUser): void`

`rxMethod<SearchUser>` — sets `loading()` and calls
`ResidentService.getAll(neighborhoodId, params)`. On success it replaces the
entity collection with `setAllEntities`, stores `response.meta` as `pagination`
and marks the store loaded. On failure it patches `setError`. A new call cancels
any in-flight request via `switchMap`.

### `create(dto: CreateUser): Promise<boolean>`

Creates a resident in the current neighborhood (via `neighborhood().publicId`),
adds the created entity with `addEntity` and refreshes `loadStats()`. Returns
`true` on success; on failure patches `setError` and returns `false`. Returns
`false` without network when no neighborhood is selected.

### `loadById(id: string): Promise<UserModel | null>`

Resolves from the current `entities()` cache first (no HTTP call). Otherwise
calls `ResidentService.getById(neighborhoodId, id)`, adds the result with
`addEntity` and returns it. Returns `null` and patches `setError` when the
request throws.

### `update(id: string, dto: UpdateUser): Promise<boolean>`

Calls `ResidentService.update(neighborhoodId, id, dto)` and applies the response
with `updateEntity` keyed by `publicId` so the cached entity stays in sync with
the server. Returns `true` on success; on failure patches `setError` and returns
`false`. Returns `false` without network when no neighborhood is selected.

> All mutation-style methods (`create`, `update`, `loadById`) return `Promise<boolean>`
> or the loaded model so pages can branch on success without reading `error()`.

### Hooks

`onInit` subscribes an `effect` to `AuthStore.isAuthenticated()`: when the user
logs out the store is reset (`store.resetState()`) so resident state does not
leak across sessions.

## Notes

- `loadById`/`update` keep the entity cache consistent (`addEntity`/`updateEntity`),
  so the home table reflects edits without a full reload.
- The store reads the active neighborhood from `ContextStore` instead of
  receiving it as a parameter, keeping call sites shallow.

## Test coverage

- `apps/web/src/app/features/residents/resident.store.spec.ts`
- Covers `loadStats`, `loadAll` (entities + pagination meta, error state),
  `loadById` (cache hit without API call, cache miss fetch + addEntity),
  `create`/`update` (success/error paths, `updateEntity` cache sync) and
  `resetState` on logout.