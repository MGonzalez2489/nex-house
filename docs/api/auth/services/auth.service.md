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
| `OnboardingService` | `AuthModule`/administration | Auto-completes onboarding when the last step is pending |

## Public contract

### `login(dto, userAgent, ip): Promise<SessionModel>`

- Finds the user by email; throws `UnauthorizedException('Invalid credentials')` when missing or when the password does not match.
- For non-`SUPERADMIN` users enforces the multi-tenant gates:
  - `ForbiddenException('Invalid neighborhood assignation.')` when no neighborhood is assigned.
  - `ForbiddenException('Neighborhood not available.')` when the neighborhood is inactive.
  - `ForbiddenException('Authentication disabled. Contact your administrator.')` when the status is `INACTIVE`.
- When the status is `PENDING_ONBOARDING` and the current step is `COMPLETE`, auto-completes onboarding and re-reads the user.
- When the status is `PASSWORD_RECOVERY`, clears the recovery state.
- Delegates session creation to `SessionService.createSession(user, userAgent, ip)`.

### `createCookie(response, refreshToken): void`

Sets the `refresh_token` HttpOnly cookie:

- `httpOnly: true`, `secure` in production, `sameSite: 'strict'`, `path: '/'`.
- `maxAge` is fixed at 7 days (independent of the session `rememberMe` lifetime).

### `refreshAuthentication(token, userAgent, ip?): Promise<SessionModel>`

Forwards to `SessionService.refreshSession(token, userAgent, ip)`. The optional `ip` is resolved in the controller so the rotated session records the caller's current IP.

### `logout(refreshToken): Promise<void>`

Forwards to `SessionService.logout(refreshToken)`.

## Test coverage

- `apps/api/src/auth/services/auth.service.spec.ts`
- Covers login success, missing user, wrong password, SUPERADMIN bypass, missing/inactive neighborhood, and inactive status.
- Note: the spec currently does not provide `UserService`/`OnboardingService` mocks, so running it requires those providers to be added (pre-existing gap).