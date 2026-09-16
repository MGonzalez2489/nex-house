# AuthController

`AuthController` exposes the public HTTP endpoints for sign-in, token refresh, and logout.

- **File:** `apps/api/src/auth/controllers/auth.controller.ts`
- **Route prefix:** `api/auth`
- **Swagger tag:** `Authentication`

## Dependencies

| Dependency | Usage |
|---|---|
| `AuthService` | `login`, `refreshAuthentication`, `logout`, `createCookie` |
| `@core/utils > getClientIp` | Shared client-IP resolution (single source of truth) |
| `@core/utils > isProd` | `secure` flag parity when clearing the cookie in production |

## Endpoints

### `POST /api/auth/login` — `login(loginDto, request, userAgent, response): Promise<SessionModel>`

Public route. Authenticates the credentials and issues the session:

- Resolves the client IP with `getClientIp(request)`.
- Calls `AuthService.login(loginDto, userAgent, ip)`.
- Sets the `refresh_token` cookie via `AuthService.createCookie(response, session.refreshToken)`.
- Returns the full `SessionModel`; the refresh token is additionally persisted in the HttpOnly cookie.

### `POST /api/auth/refresh` — `refresh(request, userAgent, response): Promise<Omit<SessionModel, 'refreshToken'>>`

Public route. Rotates the refresh token:

- Reads `request.cookies['refresh_token']`; throws `UnauthorizedException('No refresh token provided')` when absent (cookies are parsed by `cookie-parser` in `main.ts`).
- Resolves the current IP via `getClientIp(request)` so the rotated session records the caller's current IP, and forwards it to `AuthService.refreshAuthentication(oldToken, userAgent, ip)`.
- Re-sets the `refresh_token` cookie with the new refresh token.
- Returns the session data **without** the refresh token (typed `Omit<SessionModel, 'refreshToken'>`).

### `POST /api/auth/logout` — `logout(request, response): Promise<{ message: string }>`

Authenticated route (global JWT guard applies; `@Public()` is absent). Revokes the session and clears the cookie:

- Reads `request.cookies['refresh_token']`; when present, calls `AuthService.logout(refreshToken)`.
- Always clears the cookie and returns `{ message: 'Logged out successfully' }`.

## Notes

- **IP resolution** is centralized in `@core/utils` `getClientIp` (also used by `PwdRecoveryController`): `request.ip` → first `X-Forwarded-For` entry → `0.0.0.0`. Previously each handler inlined `request.ip || headers['x-forwarded-for'] || '0.0.0.0'`, which passed the whole proxy chain (e.g. `"10.0.0.1, 172.16.0.1"`) into session metadata.
- **Logout cookie removal:** `clearCookie` now uses `secure: isProd`, matching the flag with which `AuthService.createCookie` set the cookie. Previously `secure: false` was hardcoded, which could prevent strict HTTPS clients from matching/deleting the stored cookie.

## Test coverage

- `apps/api/src/auth/controllers/auth.controller.spec.ts` (8 cases)
- Covers login IP resolution (`request.ip`, first `X-Forwarded-For` entry, `0.0.0.0` fallback) and cookie set; refresh success (returned data omits `refreshToken`, new cookie set, ip forwarded) and missing-cookie rejection; logout with/without a cookie (service revoke skipped when absent, cookie always cleared with correct options, message returned).