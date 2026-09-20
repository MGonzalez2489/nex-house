# NeighborhoodService (web)

Client-side HTTP service for the neighborhood feature. Wraps the `RequestService`
and exposes typed observables against the `/api/neighborhood` endpoints.

- **File:** `apps/web/src/app/features/neighborhoods/services/neighborhood-service.ts`
- **Injectable:** Yes (`providedIn: 'root'`).
- **Consumed by:** `context.store.ts` (`getMine`, `getStreets`, `getById`).

## Dependencies

| Dependency | Usage |
|---|---|
| `RequestService` (`@core/services`) | Typed GET/POST/PATCH wrappers around `HttpClient`, converts query DTOs to `HttpParams` |

## Endpoint base

`/api/neighborhood` (proxied to the API dev server by the web dev-server proxy).

## Public contract

### `getAll(dto: Search): Observable<ApiResponse<NeighborhoodModel[]>>`

`GET /api/neighborhood` — paginated neighborhood listing with the given filters
(`first`, `rows`, `globalFilter`, ...).

### `getMine(): Observable<ApiResponse<NeighborhoodModel>>`

`GET /api/neighborhood/mine` — returns the neighborhood assigned to the current
user, mapped from `user.neighborhoodId`.

### `getById(id: string): Observable<ApiResponse<NeighborhoodModel>>`

`GET /api/neighborhood/:id` — single neighborhood by public UUID.

### `create(dto: Partial<CreateNeighborhood>): Observable<ApiResponse<NeighborhoodModel>>`

`POST /api/neighborhood` — creates a neighborhood (atomic street + admin creation
happens server-side).

### `update(id: string, dto: UpdateNeighborhood): Observable<ApiResponse<NeighborhoodModel>>`

`PATCH /api/neighborhood/:id` — updates neighborhood metadata and street catalog.

### `getStreets(dto?: Search): Observable<ApiResponse<NeighStreetModel[]>>`

`GET /api/neighborhood/streets` — paginated streets for the current user's
neighborhood. When called without criteria it defaults to a fresh copy of
`{ rows: 10, showAll: true, first: 0 }` (`{ ...defaultSearch }`) so the frozen
baseline object is never mutated by `RequestService` param conversion.

## Internal helpers

### `defaultSearch: Readonly<Search>`

Baseline pagination applied when `getStreets` is called without criteria.
`Object.freeze`-ed (`rows: 10, showAll: true, first: 0`) to prevent accidental
mutation; `getAll` callers pass their own DTO.

## Notes

- TypeError discipline: every method declares its full `Observable<ApiResponse<T>>`
  return type.
- Street/unit models deliberately reuse `@nexhouse/shared-domain/models`
  (`NeighborhoodModel`, `NeighStreetModel`) to avoid duplicating contracts.

## Test coverage

- `apps/web/src/app/features/neighborhoods/services/neighborhood-service.spec.ts`
- Covers: creation, all GET/POST/PATCH delegations (URL + payload), default
  pagination and overridden criteria for `getStreets`.