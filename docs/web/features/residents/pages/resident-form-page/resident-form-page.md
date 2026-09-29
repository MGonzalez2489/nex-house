# ResidentFormPage (web)

Smart page (routed at `"/residents/new"` and `"/residents/:id/edit"`) that
handles resident creation and update.

- **File:** `apps/web/src/app/features/residents/pages/resident-form-page/resident-form-page.ts`
- **Template:** `resident-form-page.html` (standalone, `OnPush`)
- **Input:** `id: string` (present in update mode only)

## Dependencies

| Token           | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| `ResidentStore` | `create`, `update`, `loadById`, `loading()`, `callState()` |
| `CatalogsStore` | `UserRoles()` for the role select and create prefill       |
| `ContextStore`  | `streets()` for the unit form                              |
| `UnitStore`     | `entities()` reusable units                                |
| `Router`        | navigation                                                 |

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
- `cancel()` and the header back button navigate back to the home list. The back
  button is rendered **outside** `app-page-header`, in a `flex items-start gap-3`
  row, and the header fills the rest with `class="flex-1"`.
- Header title/copy switch on `id()` presence, now expressed as
  `[title]="(id() ? 'Actualizar' : 'Nuevo') + ' residente'"` and a
  `[subTitle]` ternary. The subtitle is hidden on mobile by the component.

## Template

- Read-only summary panel (name, email, status) in update mode. Each entry is a
  `<section>` with a `text-xs font-medium text-slate-500 dark:text-slate-400`
  term and a `<p class="capitalize">` value: they are **not** headings. They used
  to be `<h4>`/`<h3>` pairs, which (a) added three fake headings to the document
  outline right after the page `h1` and the section `h2`, and (b) rendered the
  term at `text-slate-500/80` (~3.7:1, below AA). The `text-xs` term keeps its
  quiet look at 4.8:1 / 6.8:1.
- "Información general" is a raw `p-panel` header (`#header`) with the shared
  level-2 section title (`text-base font-semibold text-slate-900 dark:text-white`)
  so it matches `app-nex-card`'s `headerText`; the `.form-label`s below it are
  level 3 of the same scale.
- A sticky mobile action bar (Cancel / Save) plus the desktop `FormOptions`.

## Test coverage

- `apps/web/src/app/features/residents/pages/resident-form-page/resident-form-page.spec.ts`
- Covers: create prefill, update load/back-navigation, `buildUpdatePayload`
  diffing, invalid submit, and navigation after submit/cancel.
