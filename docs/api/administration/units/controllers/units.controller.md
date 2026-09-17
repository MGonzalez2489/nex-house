# UnitsController

`apps/api/src/administration/units/controllers/units.controller.ts`

REST controller scoped to `neighborhood/:neighborhoodId/units`. All routes pass through `NeighborhoodScopeGuard`, which rejects requests where the actor does not belong to the target neighborhood.

> Note: the path uses the singular `neighborhood` (unlike the residents controller, which uses `neighborhoods`). The web client (`apps/web/.../units/services/unit-service.ts`) calls `/api/neighborhood/:id/units`, so the route is kept as-is.

## Dependencies

| Token | Purpose |
|---|---|
| `UnitSearchService` | Paginated listing and statistics |
| `UnitService` | Unit creation |

## Routes

| Method | Path | Status | Description |
|---|---|---|---|
| `POST /` | `201` | Create a unit. Delegates to `UnitService.create(neigh.id, dto, user.id)`. Returns the raw `Unit`. |
| `GET /` | `200` | Paginated unit listing. Query params from `SearchDto`; each `Unit` is mapped with `UnitToModelMapper` into `UnitModel`. |
| `GET /stats` | `200` | Aggregated statistics (`UnitStats`): counts by status, type and street. |

## Guards

- **`NeighborhoodScopeGuard`** — controller-level guard enforcing the neighborhood scope from the `:neighborhoodId` path param.

## Response Mapping

- `findAll` returns `PaginatedResult<UnitModel>` (`data` mapped through `UnitToModelMapper`, `meta` untouched).
- `create` returns the persisted `Unit` entity.
- `findStats` returns the `UnitStats` structure from `UnitSearchService`.
