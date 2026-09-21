# RESIDENT_ROUTES (web)

Lazy-loaded route definitions and route helpers for the residents feature.

- **File:** `apps/web/src/app/features/residents/resident.routes.ts`

## Route enum

```ts
export enum RESIDENT_ROUTES_ENUM {
  HOME = "residents",
  NEW = "new",
  DETAILS = ":id",
  UPDATE = ":id/edit",
}
```

`RESIDENT_ROUTES_ENUM` is the single source of truth for navigation. Pages use
it via the `@residents/resident.routes` alias so route segment strings are never
hard-coded in controllers.

## Defined routes

| Path | Component |
|---|---|
| `""` | `ResidentHomePage` |
| `new` | `ResidentFormPage` (create mode — no `id` input) |
| `:id/edit` | `ResidentFormPage` (update mode — `id` input present) |

All routes use `loadComponent` dynamic imports. The `DETAILS` enum value is
reserved for a future read-only detail view; there is no `:id` route today.

## Usage

- `resident-home-page` navigates to `HOME/NEW` (create) and to `HOME/:id/edit`
  (view/edit) using array navigation.
- `resident-form-page` navigates back to `HOME` after a successful
  submit/cancel or when the edit target cannot be loaded.