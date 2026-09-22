# OnboardingGeneralComponent (web)

Standalone Angular component for the "general form" step of the onboarding
wizard. It wraps the shared `ProfileFormComponent` in a `Panel` and lets the user
complete/normalize their profile (phone, avatar, …) before continuing.

- **File:** `apps/web/src/app/features/onboarding/components/general-component/onboarding-general-component.ts`
- **Template:** `onboarding-general-component.html`
- **Wired in:** `apps/web/src/app/features/onboarding/pages/onboarding-home-page/onboarding-home-page.html`
  inside the `general-form` step panel.

## Inputs

- `profile = input<UserProfileModel>()` — pre-fills the shared profile form.
- `isLoading = input.required<boolean>()` — disabled/loading state of the actions.
- `callState = input<CallState>()` — onboarding store call state; fed into
  `FormOptions` so a failed profile update shows its server error via
  `FormFeedback`.

## Outputs

- `next`, `prev` — step navigation events.
- `doSubmit = output<ProfileEditPayload>()` — re-emits the typed diff payload
  built by the shared `ProfileFormComponent` (only fields that changed); the
  multipart `FormData` is built downstream by `OnboardingService.updateProfile`
  via `toProfileFormData`.

## Behavior

- The shared form lives inside the component's own `<form (ngSubmit)>`, so the
  `FormOptions` submit button (`type="submit"`) triggers `doSubmit.emit()` with
  the payload; the cancel button (`doCancel`) calls `onPrev()`, which bumps an
  internal `resyncKey` signal bound to the shared form (discarding unsaved
  edits, e.g. a freshly-uploaded avatar preview) before emitting `prev` for
  step navigation.
- Designed mobile-first: the shared form already switches from a one-column stack
  to a multi-column grid at `md:`, and `FormOptions` stacks its buttons
  full-width in a column on small screens before becoming a row at `sm:`.

## Template notes

- `ProfileFormComponent` is content-projected (`.pt-2`), followed by
  `<app-form-options submitLabel="Continuar" cancelLabel="Atrás">` bound to
  `callState()`/`isLoading()` with `(doCancel)="prev.emit()"`.

## Test coverage

- `apps/web/src/app/features/onboarding/components/general-component/onboarding-general-component.spec.ts`
- The spec sets `[profile]` via `fixture.componentRef.setInput(...)`, feeds
  `FormData` through `doSubmit` and asserts the `doSubmit`/`prev` emissions.
