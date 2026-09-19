# PassCodeValidatePage (web)

Smart (routed) page that validates the password-recovery code.

- **File:** `apps/web/src/app/features/auth/pages/pass-code-validate/pass-code-validate-page.ts`
- **Template:** `pass-code-validate-page.html`
- **Route:** `/auth/validate-code` (`AUTH_ROUTES_ENUM.PASS_VALIDATE_CODE`).

## Dependencies

| Dependency | Usage |
|---|---|
| `AuthStore` | `recoveryCode`, `codeValidation`, `loading`, `callState` |
| `Router` | Navigates to `/auth/password-recovery` on success |

## Form

`FormGroup` with a single non-nullable `code` control validated against
`/^[A-Z]{3}-\d{6}$/` (required + pattern).

## Behaviour

- `ngOnInit()` prefills the control with `AuthStore.recoveryCode()` so the user
  can confirm the code received by email.
- `onSubmit()` marks the form as touched, aborts when invalid, calls
  `AuthStore.codeValidation(code)` and on success navigates to
  `AUTH_ROUTES_ENUM.PASS_RECOVERY` (`/auth/password-recovery`).

## Template / a11y

- Single `<h1>` ("Valida tu código") with real explanatory copy.
- Placeholder corrected to `ABC-123456` so it matches the validation pattern.
- `autocomplete="one-time-code"` and `maxlength="10"` for the code input.
- `aria-describedby` now points at `code-errors` (previously `code-error`, which
  did not exist).
- `app-form-options` receives `[isLoading]` and `[callState]`.

## Test coverage

- `apps/web/src/app/features/auth/pages/pass-code-validate/pass-code-validate-page.spec.ts`
- Covers: creation, prefill from the store, successful validation + navigation,
  pattern rejection, failed request, and the rendered `<h1>` plus
  `code`/`code-errors` `aria-describedby` linkage.
