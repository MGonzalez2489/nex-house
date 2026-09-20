# NeighborhoodsStore (web)

`@ngrx/signals` feature store that owns the neighborhood listing, selection,
creation and update flow.

- **File:** `apps/web/src/app/features/neighborhoods/neighborhood.store.ts`
- **Injected with:** `withDevtools('neighborhood')`, `withReset()`,
  `withEntities`, `withCallState()`.
- **Consumed by:** `neigh-home-page`, `neigh-form-page`, `neigh-details-page`.

## State

| Field | Type | Description |
|---|---|---|
| `entities()` | `NeighborhoodModel[]` | Loaded/list neighborhoods (CollectionState) |
| `pagination` | `ApiPaginationMeta \| undefined` | `GET /` response meta (`total`, `page`, `lastPage`, `limit`) |
| `callState()` | `CallState` | `loading()` / `loaded()` / `error` from `withCallState` |
| `isInitialized` / `selectedEntity` | `boolean` / `NeighborhoodModel \| undefined` | `withEntities` feature flags |

Entity id selector: `neigh.publicId`.

## Methods

### `loadAll(dto: Search): void`

`rxMethod<Search>` — sets `loading()`, calls `NeighborhoodService.getAll(dto)`
and on success replaces the entity list with `setAllEntities` and stores
`response.meta`. On failure it patches `setError(err)` (no swallowed error
string is stored).

### `findById(id: string): Promise<NeighborhoodModel | null>`

Resolves from the current `entities()` cache first (no HTTP call). Otherwise
calls `NeighborhoodService.getById`, adds the result with `addEntity` and
returns it. Returns `null` and sets `setError` when the request throws.

### `create(dto: CreateNeighborhood): Promise<boolean>`

Calls `NeighborhoodService.create`, adds the created entity on success and
returns `true`; on failure sets `setError` and returns `false`.

### `update(id: string, dto: UpdateNeighborhood): Promise<boolean>`

Calls `NeighborhoodService.update`, applies the response with `updateEntity`
keyed by `publicId` and returns `true`; on failure sets `setError` and returns
`false`.

### Hooks

`onInit` subscribes an `effect` to `AuthStore.isAuthenticated()`: when the user
logs out the store is reset (`store.resetState()`) so neighborhood state does
not leak across sessions.

## Test coverage

- `apps/web/src/app/features/neighborhoods/neighborhood.store.spec.ts`
- Covers `loadAll` (entities + pagination meta, error state), `findById`
  (cache hit without API call, cache miss fetch), `create`/`update`
  (success/error paths) and `resetState`.