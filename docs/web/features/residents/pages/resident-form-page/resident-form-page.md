# ResidentFormPage (web)

Smart page (routed at `"/residents/new"` and `"/residents/:id/edit"`) that
handles resident creation and update.

- **File:** `apps/web/src/app/features/residents/pages/resident-form-page/resident-form-page.ts`
- **Template:** `resident-form-page.html` (standalone, `OnPush`)
- **Input:** `id: string` (present in update mode only)

## Dependencies

| Token | Purpose |
|---|---|
| `ResidentStore` | `create`, `update`, `loadById`, `loading()`, `callState()` |
| `CatalogsStore` | `UserRoles()` for the role select and create prefill |
| `ContextStore` | `streets()` for the unit form |
| `UnitStore` | `entities()` reusable units |
| `Router` | navigation |

## Form

Typed `FormGroup<CreateResidentForm>` with `email` (required + email), `userRoleId`
(required, non-nullable `string`) and `unit` (required `CreateUnit | null`,
rendered by `UnitFormComponent`).

## Bootstrapping

A single `effect` waits until `catStore.loaded()` and `contextStore.streets()`
are available, sets `isLoadingComplete` (guard against re-runs) and then either:

- **Create mode** (`id` absent): prefills `userRoleId` with the catalog entry
  whose `name === UserRoleEnum.RESIDENT`.
- **Update mode** (`id` present): calls `store.loadById(id)`; on `null`
  (error / not found) it navigates back to the home list. Otherwise it captures
  the original role/unit (to diff patch payloads) and patches the form.

A second effect disables the `email` control once an existing resident is loaded
(email is immutable per user).

## Submit / cancel

- `submit()` marks the form as touched, guards on `form.invalid`, then calls
  `store.create(...)` or `store.update(id, payload)` (both return `Promise<boolean>`)
  and navigates to the home list on success.
- `update` only sends changed fields: `userRoleId` is included when it differs
  from the original; the unit is included when `hasUnitChanged` detects a real
  change (either existing-unit reassignment or a new unit definition).
- `cancel()` and the header back button navigate back to the home list.

## Template

- Header title/copy switch on `id()` presence.
- Read-only summary panel (name, email, status) in update mode.
- A sticky mobile action bar (Cancel / Save) plus the desktop `FormOptions`.

## Test coverage

- `apps/web/src/app/features/residents/pages/resident-form-page/resident-form-page.spec.ts`
- Covers: create prefill, update load/back-navigation, `buildUpdatePayload`
  diffing, invalid submit, and navigation after submit/cancel.