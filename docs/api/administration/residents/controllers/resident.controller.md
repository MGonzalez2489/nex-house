# ResidentController

`apps/api/src/administration/residents/controllers/resident.controller.ts`

REST controller scoped to `neighborhoods/:neighborhoodId/residents`. Every route passes through `NeighborhoodScopeGuard` to ensure the actor belongs to the target neighborhood.

## Dependencies

| Token | Purpose |
|---|---|
| `ResidentService` | Create, update, avatar upload |
| `ResidentSearchService` | Paginated listing, lookups by publicId/email |
| `ResidentStatsService` | Aggregated role/status counts |

## Routes

| Method | Path | Status | Description |
|---|---|---|---|
| `POST /` | `201` | Create a resident. Delegates to `ResidentService.create`. Throws 409 on duplicate email, 400 on invalid catalog. |
| `GET /` | `200` | Paginated listing. Maps raw `User[]` via `UserToModelMapper` to `UserModel[]`. Query params forwarded from `SearchUserDto`. |
| `GET /stats` | `200` | Aggregated resident statistics (count by role, count by status). |
| `GET /:publicId` | `200 / 404` | Single resident detail with full relations (neighborhood, status, profile, role, userUnits → unit {street, type} + userUnitRole). Throws 404 if not found. |
| `PATCH /:publicId` | `200 / 404` | Update role or unit assignment. `publicId` validated with `ParseUUIDPipe`. Throws 404 if user not in neighborhood. |
| `POST /avatar` | `200` | Upload avatar for the authenticated user via `FileInterceptor('avatar')`. TODO: persistent blob storage. |

## Guards & Pipes

- **`NeighborhoodScopeGuard`** — global guard on the controller; rejects requests where the actor's `neighborhoodId` does not match the `:neighborhoodId` path param.
- **`ParseUUIDPipe`** — applied to `publicId` on `GET /:publicId` and `PATCH /:publicId`; rejects malformed UUIDs with 400.
- **`FileInterceptor('avatar')`** — multer interceptor on `POST /avatar` for multipart file upload.

## Response Mapping

- `findAll` returns `PaginatedResult<UserModel>` (raw entities mapped through `UserToModelMapper`).
- `findById` loads full relation graph and returns `UserModel`.
- `create` and `update` return the raw `User` entity (controller null-checks `create` result).
