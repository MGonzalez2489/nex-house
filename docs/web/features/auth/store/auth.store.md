# AuthStore (web)

`@ngrx/signals` store that owns the authenticated session and the password
recovery flow state.

- **File:** `apps/web/src/app/features/auth/store/auth.store.ts`
- **Provided in:** `root`.
- **Consumed by:** `auth-guard.ts`, `login-page`, `pass-recovery-request-page`,
  `pass-code-validate-page`, `pass-recovery-page`, `startup.store.ts`,
  `session-service.ts`, `request-error-interceptor.ts`.

## State

| Field | Type | Source |
|---|---|---|
| `token` | `string \| null` | `localStorage[APP_CONSTANTS.TOKEN_STORAGE_KEY]` |
| `exp` | `number` | `localStorage[APP_CONSTANTS.TOKEN_EXP]` (absolute epoch **milliseconds**) |
| `recoveryCode` | `string \| undefined` | in-memory only |
| `resetPwdToken` | `string \| null` | `localStorage[APP_CONSTANTS.TOKEN_RESET_PWD]` |

## Computed

### `isSessionExpired: Signal<boolean>`

`true` when an `exp` value exists and is `<= Date.now()`.

### `isAuthenticated: Signal<boolean>`

`true` only when a token exists **and** the session is not expired. When no
`exp` is persisted (legacy sessions) the token alone is trusted, preserving the
previous behaviour. This closes the gap where an expired token still counted as
authenticated.

## Methods

### `loadSession(newSession: Pick<SessionModel, 'token' | 'exp'>): void`

Persists `token`/`exp` and patches the state. Accepts any object carrying
`token` and `exp`, so both the login response (`SessionModel`) and the refresh
response (`Omit<SessionModel, 'refreshToken'>`) can be passed as-is.

### `clearSession(): void`

Removes **only** the three auth keys from `localStorage`
(`TOKEN_STORAGE_KEY`, `TOKEN_EXP`, `TOKEN_RESET_PWD`), resets the store, and
nulls `token`, `exp` and `resetPwdToken`. Replaces the previous
`localStorage.clear()`, which wiped unrelated application keys.

### `login(dto: Login): Promise<boolean>`

Calls `AuthService.login`, stores the returned session and reports success.

### `logout(): Promise<boolean>`

Calls `AuthService.logout()`, then **always** clears the local session in a
`finally` block so the user is never left with a stale token even if the server
revocation fails. Returns `true` on success, `false` when the API call throws.

### `pwdRecoveryRequest(email: string): Promise<boolean>`

Requests a recovery code and stores it in `recoveryCode`.

### `codeValidation(code: string): Promise<boolean>`

Exchanges the code for a reset token, stores it in `resetPwdToken` and persists
it under `TOKEN_RESET_PWD`.

### `resetPwd(pwd: string): Promise<boolean>`

Resets the password, removes the reset token from `localStorage`, loads the new
session and clears `resetPwdToken`/`recoveryCode`.

All async methods patch `withCallState` (`setLoading`/`setLoaded`/`setError`)
so pages can render `callState()` and `loading()`.

## Test coverage

- `apps/web/src/app/features/auth/store/auth.store.spec.ts`
- Covers: anonymous initialization, `loadSession` persistence, session expiry,
  scoped `clearSession`, `login` success/failure, `logout` success/failure and
  the full recovery flow.
