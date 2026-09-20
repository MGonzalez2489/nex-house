# OnboardingPwdChangeComponent (web)

Standalone Angular component for the "change your password" step of the onboarding
wizard. Rendered when the current password is temporary and must be reset before
continuing.

- **File:** `apps/web/src/app/features/onboarding/components/pwd-change-component/onboarding-pwd-change-component.ts`
- **Template:** `onboarding-pwd-change-component.html`
- **Wired in:** `apps/web/src/app/features/onboarding/pages/onboarding-page.ts`
  (`OnboardingPwdChangeComponent`), driven by `OnboardingStore.pwdStepActive()`.

## Inputs

- `isLoading = input.required<boolean>()` — disables inputs and flips the submit
  button to its loading state while the password change request is in flight.
- `user = input<UserModel>()` — used by `requirePwdChange()` to decide whether the
  panel shows the form (temporary password present) or the success/continuation
  message.

## Outputs

- `prev`, `next` — step navigation events.
- `doSubmit` — emits the `ChangePassword` payload from `onSubmit()`.

## Behandaivior

- `requirePwdChange()` returns `true` when `user()` is missing or
  `user().requirePwdChange` is `true`.
- The password form exposes `currentPwd`, `newPwd`, `confirmPwd`, a
  `passwordsMatchValidator` (non-null group validator), and trims whitespace.
- `FormValidationErrorComponent` (`@shared/components/forms`) surfaces per-field
  validation messages.

## Template notes

- The template references `Validators.required` via
  `hasValidator(Validators.required)` for the `aria-required` binding. Angular
  **standalone** templates cannot resolve an imported symbol directly, so the
  component exposes it as a class property:
  `protected readonly Validators = Validators;`.
  Removing this caused `Cannot read properties of undefined (reading 'required')`
  at runtime (the spec's `Conditional_7_Template`).

## Test coverage

- `apps/web/src/app/features/onboarding/components/pwd-change-component/onboarding-pwd-change-component.spec.ts`
- Provide the required `isLoading` input via
  `fixture.componentRef.setInput('isLoading', false)` before change-detection, or
  the suite fails with `NG0950` (required input without a provider).
