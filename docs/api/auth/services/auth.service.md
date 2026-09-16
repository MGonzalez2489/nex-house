# AuthService

`AuthService` orchestrates the authentication flows: login, refresh, logout, and cookie handling.

- **File:** `apps/api/src/auth/services/auth.service.ts`
- **Scope:** `auth` module
- **Injectable:** Yes (`@Injectable`)
- **Scope:** Nest singleton (default)

## Dependencies

| Dependency | Provided by | Usage |
|---|---|---|
| `UserSearchService` | `@administration/user/services` | Looks up users by email (with neighborhood/role/status relations) |
| `UserService` | `@administration/user/services` | Cleans the password-recovery state after successful login |
| `SessionService` | `AuthModule` | Creates, refreshes and revokes sessions |
| `CryptoService` | `AuthModule` | Compares the submitted password against the stored hash |
| `OnboardingService` | administration | Auto-completes onboarding when the last step is pending |
| `@auth/constants` | `apps/api/src/auth/constants/auth.constants.ts` | `REFRESH_TOKEN_DURATION` (7 days) as the cookie default lifetime |
| `@core/utils` | `apps/api/src/_core/utils/env-detector.util.ts` | `isProd` drives the `secure` cookie flag |

## Public contract

### `login(dto, userAgent, ip): Promise<SessionModel>`

1. Finds the user by email (private `findLoginUser` loads `neighborhood`, `role` and `status`); throws `UnauthorizedException('Invalid credentials')` when missing.
2. Compares the submitted password against the stored hash; `UnauthorizedException('Invalid credentials')` on mismatch (identical message prevents account enumeration).
3. **Neighborhood gates — non-`SUPERADMIN` users only:**
   - `ForbiddenException('Invalid neighborhood assignation.')` when no neighborhood is assigned.
   - `ForbiddenException('Neighborhood not available.')` when the neighborhood is inactive.
4. **Status gate — every role:** `ForbiddenException('Authentication disabled. Contact your administrator.')` when the status is `INACTIVE`.

   > This check lives **outside** the neighborhood block so an `INACTIVE` root
   > user can no longer bypass it (previous nesting only enforced it for
   > non-`SUPERADMIN` users).
5. If the status is `PENDING_ONBOARDING`, defers to `OnboardingService.getOnboardingStatus(user.publicId)`; when `isCompleted` is false **and** the current step is `COMPLETE`, calls `completeOnboarding(user.id)` and re-reads the user so the request continues with the updated `ACTIVE` status.
6. If the status is `PASSWORD_RECOVERY`, calls `UserService.cleanPwdRecoveryState(user.id)` because a successful login voids the pending recovery flow.
7. Logs `User '<email>' logged in successfully.` and delegates to `SessionService.createSession(user, userAgent, ip)`.

### `createCookie(response, refreshToken, maxAge = REFRESH_TOKEN_DURATION): void`

Sets the `refresh_token` HttpOnly cookie:

- `httpOnly: true`, `secure: isProd` (shared env-detector, not an inline `NODE_ENV` check), `sameSite: 'strict'`, `path: '/'`.
- `maxAge` defaults to `REFRESH_TOKEN_DURATION` (7 days) and can be overridden per call.
  - Today all sessions are 7-day (no `rememberMe` input in `LoginDto`), so the default matches reality; if a `rememberMe` flow is introduced, pass the matching lifetime instead of hardcoding.

### `refreshAuthentication(token, userAgent, ip?): Promise<SessionModel>`

Forwards to `SessionService.refreshSession(token, userAgent, ip)`. The optional `ip` is resolved in the controller so the rotated session records the caller's current IP.

### `logout(refreshToken): Promise<void>`

Forwards to `SessionService.logout(refreshToken)`.

## Known limitations / out of scope

- `AuthController.logout` clears the cookie with `secure: false` while `createCookie` sets it `secure: true` in production. Most cookie-removal implementations still delete the matching cookie regardless of the flag, but on strict clients the `Secure` mismatch could leave the cookie behind. Fixing the controller is tracked separately (this service only owns `createCookie`).
- `LoginDto` has no `rememberMe` field, so login always issues 7-day refresh tokens; the longer 30-day path exists in `TokenService`/`SessionService` but is not reachable from this flow yet.

## Test coverage

- `apps/api/src/auth/services/auth.service.spec.ts` (23 cases)
- Covers: login success and argument passing; missing user; wrong password; SUPERADMIN neighborhood bypass; missing/inactive neighborhood; **INACTIVE resident and INACTIVE SUPERADMIN (both rejected)**; onboarding autocompletion (complete step, already completed, other step — with/without re-fetch and `createSession` target); password-recovery state cleanup; `createCookie` default options (HttpOnly, `secure` via `isProd`, `sameSite`, `path`, `maxAge = REFRESH_TOKEN_DURATION`) and explicit `maxAge` override; `refreshAuthentication` delegation with and without `ip`; `logout` delegation.