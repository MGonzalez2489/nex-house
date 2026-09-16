# TokenService

`TokenService` centralizes the creation and validation of the JWTs used by the API:
access tokens, refresh tokens, and password-recovery tokens.

- **File:** `apps/api/src/auth/services/token.service.ts`
- **Scope:** `auth` module
- **Injectable:** Yes (`@Injectable`)
- **Scope:** Nest singleton (default)

## Dependencies

| Dependency | Provided by | Usage |
|---|---|---|
| `JwtService` (`@nestjs/jwt`) | `JwtModule.registerAsync` in `AuthModule` (registered as `global: true`) | Sign and verify tokens. The default secret is `JWT_SECRET` (env) |
| `ConfigService` (`@nestjs/config`) | `ConfigModule` | Reads the dedicated `JWT_RESET` secret (reset tokens only) |
| `@auth/constants` | `apps/api/src/auth/constants/auth.constants.ts` | Durations and reset-token purpose (local values, no external dependency) |

> Note: the service does not use `date-fns`. The JWT `expiresIn` is derived in
> seconds straight from the constants, removing the overflow risk that
> `intervalToDuration` had (e.g. 32 days → `{months: 1, days: 1}`).

## Relevant constants

Source: `apps/api/src/auth/constants/auth.constants.ts`.

| Constant | Value | ms | seconds (`expiresIn`) | Usage |
|---|---|---|---|---|
| `ACCESS_TOKEN_DURATION` | 15 min | `900_000` | `900` | Access token |
| `REFRESH_TOKEN_DURATION` | 7 days | `604_800_000` | `604_800` | Refresh token (`rememberMe: false`) |
| `REFRESH_TOKEN_REMEMBER_DURATION` | 30 days | `2_592_000_000` | `2_592_000` | Refresh token (`rememberMe: true`) |
| `RESET_TOKEN_EXPIRATION` | 5 min | `300_000` | `300` | Reset token |
| `PWD_RESET_PURPOSE` | `'password_reset'` | — | — | Reset-token `purpose` claim |

## Exported types

```ts
export type TokenType = 'access' | 'refresh' | 'reset_password';

export type NexHouseToken = {
  type: TokenType;
  token: string;
  expiresAtDate: string; // ISO-ish, UTC (e.g. "Tue, 11 Sep 2026 19:00:00 GMT")
  expiresInMs: number;   // epoch in ms = Date.now() + duration
};
```

## Public contract

### `createAccessToken(email, userPublicId, sessionPublicId): NexHouseToken`

Signs a token for accessing private endpoints.

- **Signed payload:** `{ email, sub: userPublicId, session: sessionPublicId }`
- **Sign options:** `expiresIn: 900` only (15 min). Uses the `JwtService` default secret (`JWT_SECRET`).
- **`type`:** `'access'`
- **Expiration:** `expiresInMs = Date.now() + ACCESS_TOKEN_DURATION`; `expiresAtDate` is that same timestamp as `toUTCString()`.

### `createRefreshAccessToken(userPublicId, sessionPublicId, rememberMe): NexHouseToken`

Signs a refresh token to renew sessions.

- **Signed payload:** `{ sub: userPublicId, session: sessionPublicId }` — deliberately **without** `email`.
- **Sign options:** depending on `rememberMe`:
  - `false` → `expiresIn: 604_800` (7 days)
  - `true` → `expiresIn: 2_592_000` (30 days)
- **`type`:** `'refresh'`
- This token's hash is stored on the session (`NxSession.refreshTokenHash`) and compared via `CryptoService.compare` during the refresh/logout flow.

### `createResetPasswordToken(email, userPublicId): NexHouseToken`

Signs a single-purpose token for the password-recovery flow.

- **Signed payload:** `{ email, sub: userPublicId, purpose: PWD_RESET_PURPOSE }`
- **Sign options:** `{ secret: <JWT_RESET>, expiresIn: 300 }` (5 min) — uses the dedicated `JWT_RESET` secret, **not** `JWT_SECRET`.
- **`type`:** `'reset_password'`
- If `JWT_RESET` is not configured, `configService.get('JWT_RESET') || ''` produces `secret: ''` (it still signs; verification will fail in `ResetPwdGuard`, which requires the secret to exist).

### `verifyToken(token)`

Delegates directly to `JwtService.verify(token)`.

- **Implicit secret:** the `JwtService` default (`JWT_SECRET`). Because of this, it should **only** be used with access/refresh tokens.
- Returns the decoded payload or propagates the `JwtService` error (expired, malformed, or invalid-signature token).
- Reset tokens are validated in `ResetPwdGuard` with `verifyAsync` + `JWT_RESET` (they do not go through this method).

## Expiration calculation

All methods share the same private helpers:

```ts
private toJwtExpirySeconds(ms: number): number { return Math.floor(ms / 1000); }
private getDateWithMS(msToAdd: number): number { return Date.now() + msToAdd; }
private getDateStrFromMs(ms: number): string { return new Date(ms).toUTCString(); }
```

- `expiresIn` (seconds) and `expiresInMs` (exact ms) both derive from the **same** constant, so the JWT's decoded `exp` and the `NexHouseToken.expiresInMs` field point to the same instant (sub-second tolerance due to JWT rounding).
- Because the values are whole seconds and the durations are multiples of 60 s, `Math.floor` loses no precision with the current constants.

## Integration

| Consumer | Usage |
|---|---|
| `SessionService` | `createAccessToken` / `createRefreshAccessToken` when signing in; `verifyToken` on refresh and logout |
| `PwdRecoveryService` | `createResetPasswordToken` in step 1 of the recovery flow |
| `ResetPwdGuard` | Verifies the reset token (with `JWT_RESET`) requiring `purpose === 'password_reset'` and an `email` present (does not use `verifyToken`) |
| `JwtStrategy` | Authenticates requests with the access token (read and verified by the global guard) |

## Security considerations and edge cases

- Reset tokens need their own secret (`JWT_RESET`) so they cannot be forged with `JWT_SECRET` or reused as access tokens. The `purpose` claim guards against "stolen logins".
- `createAccessToken` / `createRefreshAccessToken` accept empty values without validating: the payload is signed as-is. Business validation happens in the controller/service layer.
- If signing throws (e.g. invalid secret), the error propagates to the caller — the methods do not catch it.
- An empty `JWT_SECRET` would sign tokens with a weak secret; real configuration must guarantee its presence in production (env).

## Test coverage

- `apps/api/src/auth/services/token.service.spec.ts`
- Covers: exact signed payloads (including the absence of `email` on refresh), `expiresIn` derived from each constant, expiration windows (`expiresInMs`/`expiresAtDate`), empty values, `secret: ''` fallback, `JwtService` error propagation, and `verifyToken` delegation.