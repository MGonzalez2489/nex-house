# MainLayout (web)

Dynamic layout shell (standalone, `OnPush`) that picks the correct application
layout based on the authenticated user's role.

- **File:** `apps/web/src/app/_shared/layout/main-layout.ts`
- **Template:** `main-layout.html`
- **Exported through:** `@shared/layout`

## Behavior

- `store = inject(UserStore)` reads the normalized `role()` slice.
- `layoutByRole` maps each `UserRoleEnum` to its layout component:
  `SUPERADMIN` → `RootLayout`, `ADMIN` → `AdminLayout`, `RESIDENT` →
  `ResidentLayout`.
- `activeLayout` is a `computed<AppLayout | null>` that resolves the current
  role to a layout; an unknown/absent role falls back to `ResidentLayout`.
  The lookup keys the map with `role.name` (a plain `string` from
  `UserRoleModel`) cast to `UserRoleEnum`, since the model field is not typed as
  the enum.
- Renders the chosen layout via `NgComponentOutlet`.

## Test coverage

- `apps/web/src/app/_shared/layout/main-layout.spec.ts`