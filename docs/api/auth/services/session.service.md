# SessionService

`SessionService` manages the lifecycle of user sessions: it creates sessions at login, rotates them on refresh, and revokes them at logout.

- **File:** `apps/api/src/auth/services/session.service.ts`
- **Scope:** `auth` module
- **Injectable:** Yes (`@Injectable`)
- **Scope:** Nest singleton (default)

## Dependencies

| Dependency | Provided by | Usage |
|---|---|---|
| `Repository<NxSession>` (`@nestjs/typeorm`) | `TypeOrmModule.forFeature([NxSession])` in `AuthModule` | Persists and updates session rows |
| `TokenService` | `AuthModule` providers | Issues access/refresh JWTs and verifies refresh tokens |
| `CryptoService` | `AuthModule` providers | Hashes the refresh token (bcrypt) and compares it on refresh/logout |
| `UAParser` (`ua-parser-js`) | npm dependency | Parses the `User-Agent` header into browser/OS/device fields |
| `@auth/constants` (`REFRESH_TOKEN_DURATION`) | `apps/api/src/auth/constants/auth.constants.ts` | 7-day threshold used to re-derive `rememberMe` from the presented token |

## Public contract

### `createSession(user, userAgent, ip, rememberMe = false, existingSocket?): Promise<SessionModel>`

Creates a session row and mints the access + refresh token pair.

1. Parses the `User-Agent` into `browser`, `browserVersion`, `os`, `device` (falls back to `'Desktop'` when the parser yields no model).
2. Generates a fresh `publicId` (`randomUUID`) and signs the refresh token via `TokenService.createRefreshAccessToken`.
3. Persists the session with `expiresAt` stored as a real **`Date`** built from the refresh token's `expiresInMs` (never the RFC-2822 `expiresAtDate` string).
4. Signs the access token and returns:

```ts
{ user: UserModel, token, refreshToken, exp } // SessionModel
```

`existingSocket` is carried into the row so an active WebSocket registration survives the rotation.

### `refreshSession(refreshToken, userAgent, ip?): Promise<SessionModel>`

Validates the presented refresh token and mints a new session (token rotation).

- Throws `UnauthorizedException('Invalid or expired refresh token')` when JWT verification fails (the underlying JWT error is logged, never echoed to the client).
- Loads the session with `{ where: { publicId: payload.session, revoked: false }, relations: { user: true } }`.
- Throws `UnauthorizedException('Session expired or invalid')` when the session is missing, expired (`expiresAt < now`), or when the token `sub` does not match `session.user.publicId` (token confusion guard).
- Throws `UnauthorizedException('Token reuse detected')` when the presented token does not match the stored hash.
- Re-derives the original lifecycle instead of hardcoding `rememberMe`: the presented token's lifetime (`exp - iat` seconds) is compared against `REFRESH_TOKEN_DURATION / 1000`. A 7-day token stays 7-day, a 30-day token stays 30-day. Tokens without `iat`/`exp` (or with non-finite values) default to 7 days.
- Creates the rotated session with the current request `ip` when provided, otherwise falls back to the stored `session.ipAddress`.
- After the new session is persisted, **revokes the old session** (`revoked: true`) so the presented refresh token becomes single-use and cannot be replayed.

### `logout(refreshToken): Promise<void>`

Revokes the session whose `publicId` matches the token's `session` claim:

```ts
{ revoked: true, socketId: null, lastActivity: new Date() }
```

`socketId` is set to `null` (the column is nullable) because TypeORM silently skips `undefined` values in `update()` — `undefined` would leave the socket registration alive.

Invalid or expired tokens are swallowed (the cookie is cleared by the controller anyway); the event is logged with `Logger`, not `console`.

## Security considerations

- **Refresh-token rotation:** every successful refresh revokes the presented token's session and mints a new one. A stolen refresh token can only be used once.
- **Subject binding:** the `sub` claim must match the user the session row points to, preventing session-fixation across accounts.
- **No internal error leakage:** JWT library messages are logged server-side; clients only see generic `UnauthorizedException` messages.
- **Original `rememberMe` preserved:** refreshes do not silently extend a 7-day session to 30 days.

## Integration

| Consumer | Usage |
|---|---|
| `AuthService.login` | `createSession(user, userAgent, ip)` after credential validation |
| `AuthService.refreshAuthentication` | `refreshSession(token, userAgent, ip)` (ip forwarded from the controller) |
| `AuthService.logout` | `logout(refreshToken)` |
| `AuthController /refresh` | passes `request.ip` (with `x-forwarded-for` / `0.0.0.0` fallbacks) so the rotated session records the caller's current IP |

## Test coverage

- `apps/api/src/auth/services/session.service.spec.ts`
- Covers: 7-day vs 30-day token creation, `expiresAt` stored as `Date`, device fallback, socket propagation, invalid/expired/missing sessions, `sub` mismatch, hash mismatch, `rememberMe` re-derivation (7/30 days and missing claims), IP forwarding/fallback, session rotation, and logout revocation with `socketId: null`.
- Run with: `NODE_OPTIONS=--experimental-vm-modules npx nx test api --testPathPatterns=session.service.spec`
- Note: this repo's Jest 30 setup requires `--experimental-vm-modules` to load the ESM `@nestjs/*` packages.