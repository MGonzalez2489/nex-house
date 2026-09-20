# OnboardingFinishComponent (web)

Standalone Angular component for the last step of the onboarding wizard. It
confirms the account is ready and shows a summary of the user's general info and
their assigned unit, following the same mobile-first, friendly design as the
welcome step.

- **File:** `apps/web/src/app/features/onboarding/components/finish-component/onboarding-finish-component.ts`
- **Template:** `onboarding-finish-component.html`
- **Wired in:** `apps/web/src/app/features/onboarding/pages/onboarding-home-page/onboarding-home-page.html`
  inside the `complete` step panel.

## Inputs

- `profile = input<UserProfileModel>()` — user profile; feeds the greeting
  (`firstName`, `fullName`).
- `user = input<UserModel>()` — used as fallback display name and for the email row.
- `role = input<UserRoleModel>()` — shown as a "Rol" row when present.
- `units = input<UserUnitModel[]>([])` — assigned units; the first one (if any) is
  summarized.

## Outputs

- `complete` — emitted by the "Ir al Dashboard" button; the parent calls
  `store.complete()` and navigates to the dashboard.

## Behavior

- `firstName()` → `profile().firstName` for the greeting.
- `displayName()` → `profile().fullName` (guarding against the `'null'` string) or
  falls back to `user().email`.
- `unit()` → `units()[0]`.
- The unit card shows **Identificador**, **Calle** (`unit.unit.street.name`),
  **Tipo** (`unit.unit.type.displayName`), **Relación**
  (`unit.userUnitRole.displayName`, e.g. "Propietario"/"Inquilino") and **Habita la
  unidad** (`unit.isCurrentOccupant` → "Sí"/"No"). Street/type are only rendered
  when the relations are loaded (the API `/user` endpoint loads
  `unit: { street, type }`).
- When there is no unit, the unit card shows a friendly hint instead of an empty
  definition list.

## Template notes

- Centered header with an emerald `pi pi-check` badge, a `firstName`-based greeting
  and a short confirmation message. Info cards below are left-aligned.
- Both summary cards use Tailwind utility classes only (slate/cyan palette from the
  app theme, matching the welcome step); no component-level CSS and no inline styles.
- `dl`/`dt`/`dd` are used for the account/unit definition lists; the layout is a
  single column on mobile and two columns from `sm:` up.

## Test coverage

- `apps/web/src/app/features/onboarding/components/finish-component/onboarding-finish-component.spec.ts`
- The spec provides inputs via `fixture.componentRef.setInput(...)` and validates
  the greeting, the email row, the unit card content (identifier, street, type,
  relation role and occupancy), the empty-unit hint and the `complete` emission on
  "Ir al Dashboard".