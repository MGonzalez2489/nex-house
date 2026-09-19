# AuthService (web)

Client-side HTTP service for the auth feature. Wraps the `RequestService`
(typed `HttpClient`) and exposes the `/api/auth` contract as typed observables.

- **File:** `apps/web/src/app/features/auth/services/auth-service.ts`
- **Injectable:** Yes (`providedIn: 'root'`).
- **Consumed by:** `auth.store.ts` (login/logout/recovery flows),
  `request-error-interceptor.ts` (`refreshSession`).

## Dependencies

| Dependency | Usage |
|---|---|
| `RequestService` (`@core/services`) | Typed POST wrapper around `HttpClient` |

## Endpoint base

`/api/auth` (proxied to the API dev server by the web dev-server proxy).

## Public contract

### `login(credentials: Login): Observable<ApiResponse<SessionModel>>`

`POST /api/auth/login` — issues a session for the given credentials. The API
also sets the `refresh_token` HttpOnly cookie.

### `refreshSession(): Observable<ApiResponse<Omit<SessionModel, 'refreshToken'>>>`

`POST /api/auth/refresh` with `withCredentials: true` (the refresh token lives
in an HttpOnly cookie, so credentials must be sent). The response intentionally
omits `refreshToken` because the API rotates and re-sets the cookie instead of
returning it in the body.

### `logout(): Observable<ApiResponse<{ message: string }>>`

`POST /api/auth/logout` with `withCredentials: true` — revokes the server
session and clears the refresh cookie. Returns the API message payload.

### `recoveryRequest(email: string): Observable<ApiResponse<RecoveryCodeResponse>>`

`POST /api/auth/pwd-recovery-request` — starts the password recovery flow. The
returned `code` is only populated by the API outside production.

### `codeValidation(code: string): Observable<ApiResponse<ResetPasswordToken>>`

`POST /api/auth/code-validation` — exchanges a recovery code for a short-lived
reset token.

### `resetPwd(pwd: string): Observable<ApiResponse<SessionModel>>`

`POST /api/auth/reset-password` — sets the new password and returns a fresh
session.

## Notes

- Every method declares its full `Observable<ApiResponse<T>>` return type.
- Contracts are reused from `@nexhouse/shared-domain/{interfaces,models}`
  (`Login`, `RecoveryCodeResponse`, `ResetPasswordToken`, `SessionModel`).

## Test coverage

- `apps/web/src/app/features/auth/services/auth-service.spec.ts`
- Covers: creation, login URL/payload delegation and error forwarding, the three
  recovery endpoints, and the session lifecycle endpoints (`refreshSession`,
  `logout`) including credentials flags.
