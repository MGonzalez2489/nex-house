# OnboardingUnitComponent (web)

Standalone Angular component for the "create unit" step of the onboarding
wizard. It wraps the shared `UnitFormComponent` in a `Panel` and, for the first
admin, captures the identifier, street, type, role and whether the current user
lives on the unit.

- **File:** `apps/web/src/app/features/onboarding/components/unit-component/onboarding-unit-component.ts`
- **Template:** `onboarding-unit-component.html`
- **Wired in:** `apps/web/src/app/features/onboarding/pages/onboarding-home-page/onboarding-home-page.html`
  inside the `create-unit` step panel.

## Inputs

- `streets = input.required<NeighStreetModel[]>()` — selectable streets.
- `unitTypes = input.required<BaseCatalogModel[]>()` — selectable unit types.
- `unitRoles = input.required<BaseCatalogModel[]>()` — selectable
  unit-unit relations (e.g. Propietario/Inquilino).
- `user = input<UserModel>()` — used by `UnitFormComponent` to pre-fill defaults
  (e.g. street) and whether the user is the current occupant.
- `isLoading = input.required<boolean>()` — disabled/loading actions state.
- `callState = input<CallState>()` — onboarding store call state; fed into
  `FormOptions` so a failed unit creation shows its server error via
  `FormFeedback`.

## Outputs

- `next`, `prev` — step navigation events.
- `doSubmit = output<CreateUnit>()` — re-emits the `CreateUnit` payload built by
  the shared `UnitFormComponent`.

## Behavior

- The shared form lives inside the component's own `<form (ngSubmit)>`, so the
  `FormOptions` submit button (`type="submit"`) triggers `doSubmit.emit()`; the
  cancel button emits `prev`.
- Mobile-first: the shared form already uses a single-column stack up to `sm:`
  before switching to a three-column grid, and `FormOptions` stacks its buttons
  full-width in a column on small screens before becoming a row at `sm:`.

## Template notes

- `UnitFormComponent` is content-projected (`.pt-2`), followed by
  `<app-form-options submitLabel="Continuar" cancelLabel="Atrás">` bound to
  `callState()`/`isLoading()` with `(doCancel)="prev.emit()"`.

## Test coverage

- `apps/web/src/app/features/onboarding/components/unit-component/onboarding-unit-component.spec.ts`
- The spec feeds catalogs/streets/user inputs, submits a `CreateUnit` through
  `doSubmit` and asserts the `doSubmit`/`prev`/`next` emissions.
