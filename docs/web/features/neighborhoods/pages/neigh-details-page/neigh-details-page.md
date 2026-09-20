# NeighDetailsPage (web)

Read-only detail page for a single neighborhood.

- **File:** `apps/web/src/app/features/neighborhoods/pages/neigh-details-page/neigh-details-page.ts`
- **Template:** `neigh-details-page.html` (standalone)

## Inputs

| Input | Type | Description |
|---|---|---|
| `id` | `string \| undefined` | Neighborhood `publicId` from the `:id` route param |

## Behavior

- An `effect` watches `id()` and calls `store.findById(id)` (which resolves
  from the store cache first, then falls back to `GET /:publicId`).
- The resolved model is held in the `neighborhood` signal.

## Actions

| Method | Behavior |
|---|---|
| `back()` | Navigates to `NEIGHBORHOOD_ROUTES_ENUM.HOME` (aliased constant, no raw strings) |
| `edit()` | Navigates to `HOME/:id/edit` via `NEIGHBORHOOD_ROUTES_ENUM.HOME` + `publicId` |

## Template

- Info panel with `NeighStatusTag`, created/updated dates (`DatePipe`), a
  `location` section (depends on `address?.city`), and the street listing
  iterated with `@for (street of neighborhood().streets; track street.publicId)`.
- "Volver al listado" and "Editar fraccionamiento" buttons.

## Strengths / notes

- A purely presentational page: all data access goes through the store.
- Output-only navigation; `back`/`edit` rely on the route enum to stay aligned
  with changes in `neighborhood.routes.ts`.