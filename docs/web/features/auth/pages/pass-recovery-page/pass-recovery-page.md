# PassRecoveryPage (web)

Smart (routed) page that sets a new password at the end of the recovery flow.

- **File:** `apps/web/src/app/features/auth/pages/pass-recovery-page/pass-recovery-page.ts`
- **Template:** `pass-recovery-page.html`
- **Route:** `/auth/password-recovery` (`AUTH_ROUTES_ENUM.PASS_RECOVERY`).

## Dependencies

| Dependency | Usage |
|---|---|
| `AuthStore` | `resetPwd`, `callState`, `loading` |
| `Router` | Navigates to the dashboard home on success |
| `StartupStore` | `armLoading()` after a successful reset |

## Form

`FormGroup<ResetPwdForm>` with two non-nullable controls and a group-level
`passwordMatchValidator`:

| Control | Validators | Notes |
|---|---|---|
| `password` | `required`, `minLength(4)` | `new-password` autocomplete |
| `confirmPassword` | `required`, `minLength(4)` | `new-password` autocomplete |

`passwordMatchValidator` sets `{ mismatch: true }` on the group when `password`
and `confirmPassword` differ.

## Behaviour

`doSubmit()` marks everything as touched, aborts when the form is invalid, calls
`AuthStore.resetPwd(password)` and, on success, arms the startup store and
navigates to `DASHBOARD_ROUTES_ENUM.HOME`.

## Accessibility

`confirmPasswordDescribedBy()` returns a space-separated list of the error ids
the confirm input should reference:

- `confirm-password-error` while the control is touched and has control-level
  errors;
- `confirm-password-mismatch` while the form (group) is touched and carries the
  mismatch error.

This removes the hardcoded `aria-describedby`, which always pointed at a single
element regardless of which error was actually shown. The page also renders a
single `<h1>` ("Reestablecer Contraseña") and real copy.

## Test coverage

- `apps/web/src/app/features/auth/pages/pass-recovery-page/pass-recovery-page.spec.ts`
- Covers: creation, successful reset (new password + splash + navigation),
  invalid form short-circuit, failed request, the single `<h1>`, and the
  `confirm-password-mismatch` description when passwords differ.
