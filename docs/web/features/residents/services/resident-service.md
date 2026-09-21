# ResidentService (web)

Client-side HTTP service for the residents feature. Wraps `RequestService` and
exposes typed observables against the `/api/neighborhoods/:neighborhoodId/residents`
endpoints.

- **File:** `apps/web/src/app/features/residents/services/resident-service.ts`
- **Injectable:** Yes (`providedIn: 'root'`).
- **Consumed by:** `resident.store.ts`.

## Dependencies

| Dependency | Usage |
|---|---|
| `RequestService` (`@core/services`) | Typed GET/POST/PATCH wrappers around `HttpClient`; converts query DTOs (incl. `SearchUser`) to `HttpParams` |

## Endpoint base

`/api/neighborhoods/:neighborhoodId/residents` (proxied to the API dev server by
the web dev-server proxy).

## Public contract

Every method receives the active `neighborhoodId` (the neighborhood `publicId`
from `ContextStore`).

| Method | HTTP | Path |
|---|---|---|
| `getAll(neighborhoodId, dto: SearchUser)` | `GET` | `/api/neighborhoods/:id/residents` |
| `getById(neighborhoodId, id)` | `GET` | `/api/neighborhoods/:id/residents/:userId` |
| `create(neighborhoodId, dto: CreateUser)` | `POST` | `/api/neighborhoods/:id/residents` |
| `update(neighborhoodId, id, dto: UpdateUser)` | `PATCH` | `/api/neighborhoods/:id/residents/:userId` |
| `getStats(neighborhoodId)` | `GET` | `/api/neighborhoods/:id/residents/stats` |

### Return types

- `getAll` → `Observable<ApiResponse<UserModel[]>>` (server-paginated)
- `getById` / `create` / `update` → `Observable<ApiResponse<UserModel>>`
- `getStats` → `Observable<ApiResponse<UserStats>>`

## Internal helpers

### `buildUrl(neighborhoodId: string): string`

Single source of truth for the endpoint base; every method composes its path from
it so the API contract lives in one place.

## Notes

- No `delete` method is exposed: the API supports resident removal, but the web
  feature has no UI/flow for it yet. It can be added when that flow is built.
- Reuses `@nexhouse/shared-domain` contracts (`UserModel`, `UserStats`,
  `CreateUser`, `UpdateUser`, `SearchUser`) instead of duplicating types.
- The unused `neighborhood`/`users` naming variant and the leftover commented-out
  URL were removed during cleanup.

## Test coverage

- `apps/web/src/app/features/residents/services/resident-service.spec.ts`
- Covers: creation, URL construction for every method, payload forwarding and
  query-param serialization through the mocked `RequestService`.