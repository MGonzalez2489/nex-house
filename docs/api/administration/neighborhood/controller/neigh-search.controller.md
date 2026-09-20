# NeighSearchController

Read-only REST controller exposing neighborhood listing, assigned-neighborhood
and detail lookups. All responses are shaped through `NeighborhoodToModelMapper`
so the frontend always consumes the `NeighborhoodModel` contract.

- **File:** `apps/api/src/administration/neighborhood/controller/neigh-search.controller.ts`
- **Scope:** `neighborhood` module — registered in `NeighborhoodModule` alongside `NeighborhoodController`.
- **Route prefix:** `/api/neighborhood` (global `api` prefix from main.ts).
- **Swagger tag:** `Neighborhood` (docs at `/api/docs`).

## Route map

| Route | Method | Controller method | Service call | HTTP |
|---|---|---|---|---|
| `/api/neighborhood` | `GET` | `findAll` | `NeighborhoodSearchService.findAll(dto)` | `200` |
| `/api/neighborhood/mine` | `GET` | `findMine` | `findById(user.neighborhoodId, ...)` | `200` / `404` |
| `/api/neighborhood/streets` | `GET` | `findStreets` | `NeighStreetService.findAll(user.neighborhoodId, filters)` | `200` |
| `/api/neighborhood/:publicId` | `GET` | `findOne` | `findByPublicId(publicId, ...)` | `200` / `404` |

## Endpoint details

### `GET /api/neighborhood` — `findAll`

- Uses `HttpCacheInterceptor` + `CacheTTL(60*5)`; the cache key namespace is
  `cache:/api/neighborhood*` and is evicted by `NeighborhoodService` on every
  write operation.
- Maps every row through `NeighborhoodToModelMapper` and returns the
  `PaginatedResult<NeighborhoodModel>` wrapper (`data` + `meta`).

### `GET /api/neighborhood/mine` — `findMine`

- Resolves the neighborhood assigned to the current user via
  `findById(user.neighborhoodId, { streets, address.city.state })`.
- `404` when `user.neighborhoodId` does not map to a record.
- Returns a single `NeighborhoodModel` (mapped).

### `GET /api/neighborhood/streets` — `findStreets`

- Delegates to `NeighStreetService.findAll(user.neighborhoodId, filters)` and
  returns `PaginatedResult<NeighStreet>`. Only usable by actors with an
  assigned neighborhood.

### `GET /api/neighborhood/:publicId` — `findOne`

- `publicId` validated with `ParseUUIDPipe` → `400` for non-UUID.
- Loads `streets` and `address.city.state` explicitly so the mapped model
  includes the full location graph.
- `404` when no record matches the public ID.
- Returns a single `NeighborhoodModel` (mapped).

## Mapper contract

<details>
<summary>Shape produced by <code>NeighborhoodToModelMapper</code></summary>

```ts
interface NeighborhoodModel {
  publicId: string;
  name: string;
  isActive: boolean;
  streets: { publicId?: string; name: string }[];
  address?: {
    publicId: string;
    zipCode: string;
    latitude: number;
    longitud: number;
    city?: { publicId: string; name: string; displayName: string };
  };
}
```
</details>

## Test coverage

- `apps/api/src/administration/neighborhood/controller/neigh-search.controller.spec.ts`
- Covers: paginated `findAll` mapping, `findMine` assigned lookup plus `404`,
  `findStreets` delegation, and `findOne` detail lookup with explicit relations
  plus `404`.