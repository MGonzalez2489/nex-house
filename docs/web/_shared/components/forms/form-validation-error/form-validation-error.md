# FormValidationErrorComponent (web)

Shared presentational component that renders the validation messages of a single
form control once it has been touched. Used across every form in the app (auth,
onboarding, user profile, residents, neighborhoods, units).

- **File:** `apps/web/src/app/_shared/components/forms/form-validation-error/form-validation-error.ts`
- **Messages catalog:** `form-error-messages.ts`
- **Exported through:** `@shared/components/forms`

## Inputs

| Name | Type | Description |
|---|---|---|
| `errors` | required `ValidationErrors \| null` | Angular errors map of the bound control |
| `touched` | required `boolean` | `touched` flag of the bound control |
| `label` | `string` | Human field label used to build the Spanish message |

Callers pass an `id` on the host element (e.g. `<app-form-validation-error
id="firstName-errors">`); that host id is what the input's `aria-describedby`
references.

## Behavior

- `shouldShowErrors` = `errors` present **and** `touched`.
- `errorMessages` maps each error key to a Spanish message via `ERROR_MESSAGES`,
  falling back to `{label}: Invalid field ({key})` for unmapped keys.
- The rendered container exposes `role="alert"` so a screen reader announces the
  messages as soon as they appear (complementing `aria-describedby`).

## Test coverage

- `apps/web/src/app/_shared/components/forms/form-validation-error/form-validation-error.spec.ts`
- Covers clean/untouched states, single and multiple errors, dynamic constraints
  (minlength), the un-mapped-key fallback, and the `role="alert"` region.