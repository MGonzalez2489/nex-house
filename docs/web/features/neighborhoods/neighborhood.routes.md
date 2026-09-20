# NEIGHBORHOOD_ROUTES (web)

Lazy-loaded route definitions and route helpers for the neighborhood feature.

- **File:** `apps/web/src/app/features/neighborhoods/neighborhood.routes.ts`

## Route enum

```ts
export enum NEIGHBORHOOD_ROUTES_ENUM {
  HOME = "neighborhoods",
  NEW = "new",
  DETAILS = ":id",
  UPDATE = ":id/edit",
}
```

`NEIGHBORHOOD_ROUTES_ENUM` is the single source of truth for navigation. Pages
use it via the `@neighborhoods/neighborhood.routes` alias so route segment
strings are never hard-coded in templates/controllers.

## Defined routes

| Path | Component |
|---|---|
| `""` | `NeighHomePage` |
| `new` | `NeighFormPage` (create mode — no `id` input) |
| `:id` | `NeighDetailsPage` |
| `:id/edit` | `NeighFormPage` (update mode — `id` input present) |

All routes use `loadComponent` dynamic imports.

## Usage

- `neigh-home-page` navigates to `HOME/NEW` from the create buttons.
- `neigh-details-page` navigates back to `HOME` and to `HOME/:id/edit`.
- `neigh-form-page` navigates back to `HOME` after a successful submit/cancel.