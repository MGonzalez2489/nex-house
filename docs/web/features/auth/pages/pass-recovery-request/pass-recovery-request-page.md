# PassRecoveryRequestPage (web)

Smart (routed) page that starts the password recovery flow.

- **File:** `apps/web/src/app/features/auth/pages/pass-recovery-request/pass-recovery-request-page.ts`
- **Template:** `pass-recovery-request-page.html`
- **Route:** `/auth/recovery-request` (`AUTH_ROUTES_ENUM.PASS_RECOVERY_REQUEST`).

## Dependencies

| Dependency | Usage |
|---|---|
| `AuthStore` | `pwdRecoveryRequest`, `loading`, `callState` |
| `Router` | Navigates to `/auth/validate-code` on success |

## Form

`FormGroup` with a single non-nullable `email` control (`required`, `email`).

## Behaviour

`onSubmit()` marks the form as touched, aborts when invalid, calls
`AuthStore.pwdRecoveryRequest(email)` and on success navigates to
`AUTH_ROUTES_ENUM.PASS_VALIDATE_CODE` (`/auth/validate-code`). The returned
recovery code is held in the store for the next step.

## Template / a11y

- Single `<h1>` ("Encuentra tu cuenta") with real explanatory copy (replaces
  the Lorem ipsum placeholder).
- Email rendered by `AuthEmailField`; the validation error is announced through
  the matching `email-errors` id.
- Link "Ya tengo código" to the code validation route.

## Test coverage

- `apps/web/src/app/features/auth/pages/pass-recovery-request/pass-recovery-request-page.spec.ts`
- Covers: creation, successful request + navigation, invalid email
  short-circuit, failed request, and the rendered `<h1>` and email input.
