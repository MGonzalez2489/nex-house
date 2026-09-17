# NeighSearchController

Read-only REST controller for querying neighborhoods, the current user's
assigned neighborhood, and its streets.

- **File:** `apps/api/src/administration/neighborhood/controller/neigh-search.controller.ts`
- **Scope:** `neighborhood` module — registered in `NeighborhoodModule` alongside `NeighborhoodController`.
- **Route prefix:** `/api/neighborhood` (global `api` prefix from main.ts).
- **Swagger tag:** `Neighborhood` (docs at `/api/docs`).

## Route map (all `GET`)

| Route | Method | Service call | Purpose |
|---|---|---|---|
| `/api/neighborhood` | `findAll` | `NeighborhoodSearchService.findAll(dto)` | Paginated list mapped to `NeighborhoodModel` |
| `/api/neighborhood/mine` | `findMine` | `findById(user.neighborhoodId, { streets: true })` | Neighborhood assigned to current user |
| `/api/neighborhood/streets` | `findStreets` | `NeighStreetService.findAll(user.neighborhoodId, filters)` | Paginated streets of current neighborhood |
| `/api/neighborhood/:publicId` | `findOne` | `NeighborhoodSearchService.findByPublicId(publicId)` | Single neighborhood by public UUID |

## Endpoint details

- **`findAll`** — query `SearchNeighDto` (pagination via `SearchDto` + `isActive`
  bool). `@UseInterceptors(HttpCacheInterceptor)` + `@CacheTTL(60 * 5)` cache each
  `cache:<url>` key (query params included) in memory for 5 minutes. Results are
  mapped with `NeighborhoodToModelMapper` (address city / state + streets) and
  returned as `PaginatedResult<NeighborhoodModel>`.
- **`findMine`** — resolves the current user's neighborhood from
  `user.neighborhoodId` (from the JWT via `@CurrentUser`). Throws
  `NotFoundException('Neighborhood not assigned.')` (404) when missing.
- **`findStreets`** — delegates to `NeighStreetService.findAll` scoped to
  `user.neighborhoodId` with the `SearchDto` filters; returns
  `PaginatedResult<NeighStreet>`.
- **`findOne`** — `publicId` validated with `ParseUUIDPipe` → 400 for non-UUID.
  Throws `NotFoundException` (404) when no neighborhood matches.

## Route ordering

Static routes (`mine`, `streets`) are declared **before** the parameterized
`:publicId` route so they are never shadowed by UUID matching.

## Test coverage

- `apps/api/src/administration/neighborhood/controller/neigh-search.controller.spec.ts`
- Covers (with mocked search/street services and `CACHE_MANAGER` + `Reflector`
  for the HTTP-cache interceptor's DI): `findAll` mapping to `NeighborhoodModel`
  with `meta` passthrough; `findMine` success and `NotFoundException`; `findStreets`
  delegation with the user's neighborhood scope; `findOne` success and
  `NotFoundException`.