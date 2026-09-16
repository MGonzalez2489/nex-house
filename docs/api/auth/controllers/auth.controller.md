# AuthController

`AuthController` exposes the public HTTP endpoints for sign-in, token refresh, and logout.

- **File:** `apps/api/src/auth/controllers/auth.controller.ts`
- **Route prefix:** `api/auth`
- **Swagger tag:** `Authentication`

## Endpoints

### `POST /api/auth/login` — `login(loginDto, request, userAgent, response)`

Public route. Authenticates the credentials and issues the session:

- Resolves the client IP with `request.ip || x-forwarded-for || '0.0.0.0'`.
- Calls `AuthService.login(loginDto, userAgent, ip)`.
- Sets the `refresh_token` cookie from the returned refresh token.
- Returns the `SessionModel` (access token, exp, user) — the refresh token is only exposed via the cookie.

### `POST /api/auth/refresh` — `refresh(request, userAgent, response)`

Public route. Rotates the refresh token:

- Reads the `refresh_token` cookie; throws `UnauthorizedException('No refresh token provided')` when absent.
- Resolves the current IP with the same `request.ip || x-forwarded-for || '0.0.0.0'` fallback used on login and forwards it, so the rotated session records the caller's current IP.
- Calls `AuthService.refreshAuthentication(oldToken, userAgent, ip)`.
- Re-sets the `refresh_token` cookie with the new refresh token.
- Returns the session data **without** the refresh token.

### `POST /api/auth/logout` — `logout(request, response)`

Authenticated route (global JWT guard applies; `@Public()` is absent). Revokes the session and clears the cookie:

- Reads the `refresh_token` cookie; when present, calls `AuthService.logout(refreshToken)`.
- Always clears the cookie (`clearCookie`) and returns `{ message: 'Logged out successfully' }`.

## Notes

- The IP resolution fallback chain is shared with the login handler to keep session metadata consistent across the whole session lifecycle.
- Cookie options are centralized in `AuthService.createCookie`.

## Test coverage

- `apps/api/src/auth/controllers/auth.controller.spec.ts`
- Covers the login IP resolution fallbacks (`request.ip`, `x-forwarded-for`, `0.0.0.0`).
- Note: the spec mock of `AuthService` does not stub `createCookie`, so the login tests currently fail (pre-existing gap).