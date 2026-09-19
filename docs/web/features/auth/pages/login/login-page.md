# LoginPage (web)

Smart (routed) page for `POST /api/auth/login`.

- **File:** `apps/web/src/app/features/auth/pages/login/login-page.ts`
- **Template:** `login-page.html`
- **Route:** `/auth/login` (`AUTH_ROUTES_ENUM.LOGIN`).

## Dependencies

| Dependency | Usage |
|---|---|
| `AuthStore` | `login`, `callState`, `loading` |
| `Router` | `navigateByUrl(/dashboard)` on success |
| `StartupStore` | `armLoading()` to start the shell bootstrap after login |

## Form

`FormGroup<LoginForm>` with two non-nullable controls:

| Control | Validators | Notes |
|---|---|---|
| `email` | `required`, `email` | Defaulted to `root@test.com` (development convenience) |
| `password` | `required`, `minLength(4)` | Defaulted to `1234` (development convenience) |

The default credentials are intentionally kept during the development phase and
must be removed before a production release.

## Behaviour

`doSubmit()` marks the form as touched, aborts when invalid, calls
`AuthStore.login`, and on success arms the startup store and navigates to
`DASHBOARD_ROUTES_ENUM.HOME`.

## Template / a11y

- Single `<h1>` ("Bienvenido de vuelta").
- Email rendered by `AuthEmailField` (fixes the `aria-describedby` mismatch and
  adds `autocomplete="email"`).
- Password uses `autocomplete="current-password"` (was `off`).
- Renders the email/`password-error` validation messages and the "forgot
  password" link to `/auth/recovery-request`.

## Test coverage

- `apps/web/src/app/features/auth/pages/login/login-page.spec.ts`
- Covers: creation, successful login (credentials, splash, navigation), failed
  login and invalid form short-circuit, plus the rendered `<h1>` and email
  input.
