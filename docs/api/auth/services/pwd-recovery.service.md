# PwdRecoveryService

`PwdRecoveryService` implements the 3-step password-recovery flow:
1. **`createRecoveryCode`** — validate the user by email and persist a 30-minute recovery code.
2. **`validateCode`** — check the code, then issue a short-lived, single-purpose reset token.
3. **`updatePwd`** — validate the token, set the new password, and open a session.

- **File:** `apps/api/src/auth/services/pwd-recovery.service.ts`
- **Scope:** `auth` module
- **Injectable:** Yes (`@Injectable`), Nest singleton (default)

## Dependencies

| Dependency | Provided by | Usage |
|---|---|---|
| `UserSearchService` (`@administration/user/services`) | `UserModule` | `findByEmailOrThrow` / `findOne` lookups |
| `UserService` (`@administration/user/services`) | `UserModule` | `update` (persist code/token) and `updatePasswordOnRecoveryProcess` |
| `TokenService` | `AuthModule` | `createResetPasswordToken` (step 2) |
| `SessionService` | `AuthModule` | `createSession` (step 3, after the password is changed) |
| `CryptoService` (`@core/services`) | `AuthModule` (global core) | `isPasswordStrong` strength validation in step 3 |
| `@auth/constants > RECOVERY_CODE_PATTERN` | `apps/api/src/auth/constants/auth.constants.ts` | `^[A-Z]{3}-\d{6}$` code format |

## Relevant constants / helpers

| Source | Value | Usage |
|---|---|---|
| `RECOVERY_CODE_TTL_MINUTES` (private) | `30` | Recovery-code validity on top of `addMinutes` |
| `isProd` (`@core/utils > env-detector`) | `NODE_ENV === 'production'` | When true, the API **never returns the recovery code** in the response |
| `CryptoService.isPasswordStrong` | `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/` | New-password strength gate |
| `TokenService.createResetPasswordToken` | 5 min, `JWT_RESET` secret, `purpose: 'password_reset'` | Step-2 token |

Recovery codes are generated with a CSPRNG (`randomInt` from `node:crypto`):
three uppercase letters `65 + randomInt(26)` and a six-digit number
`randomInt(100000, 1000000)`, joined as `AAA-######`.

> Earlier versions used `Math.random()` for this credential. That is not
> cryptographically secure for an initial credential that effectively grants
> account takeover within its 30-minute window — it was replaced by `randomInt`.

## Public contract

### `createRecoveryCode(email: string): Promise<RecoveryCodeResponseDto>`

1. Loads the user via `findByEmailOrThrow(email, undefined, { neighborhood, status, role })`.
2. **Guard (non-superadmin users only, `UserRoleEnum.SUPERADMIN` bypass):**
   - Missing `neighborhood` → `ForbiddenException('El usuario no pertenece a un fraccionamiento.')`.
   - `neighborhood.isActive === false` → `ForbiddenException('El usuario pertenece a un fraccionamiento deshabilitado.')`.
3. `UserStatusEnum.INACTIVE` → `ForbiddenException('El usuario esta deshabilitado')`.
4. Generates a `AAA-######` code and persists `recoveryCode` + `recoveryCodeExpiration` (now + 30 min, `toUTCString()`) via `UserService.update(neighborhoodId, publicId, dto, user)`.
5. Returns `{ code }` in non-prod only (`isProd` false strips the field).

> The `neighborhood` null-check was added because the previous one-liner
> `!user.neighborhood.isActive` thrown a raw `TypeError` (500) whenever a
> non-superadmin user had no neighborhood — the API never produced the
> intended `403`.

### `validateCode(code: string): Promise<ResetPasswordTokenDto>`

1. Finds the user holding `recoveryCode` (`findOne({ recoveryCode: code })`).
2. Not found → `BadRequestException('No se encontro uso para el codigo ...')`.
3. **Expiration guard:** `recoveryCodeExpiration` is missing **or** in the past
   (`isPast`) → `BadRequestException('El codigo de recuperacion ha expirado.')`.
   The missing-field branch prevents a `null`/empty expiration from being treated
   as non-expired (`new Date(null)` is an `Invalid Date`, so `isPast` returned false).
4. Issues the purpose-limited reset token and persists it as `recoveryToken`.
5. Returns `{ token, exp }` (`exp` in ms).

### `updatePwd(email, newPwd, userAgent, ip, resetToken)`

1. Loads the user (`findByEmailOrThrow` with `status`).
2. `status !== PASSWORD_RECOVERY` → `BadRequestException('Usuario fuera de proceso.')`.
3. **Strength gate:** `!isPasswordStrong(newPwd)` →
   `BadRequestException('La contrasena no cumple con los requisitos de seguridad.')`.
   This mirrors the account-creation rules and does not rely on the transport
   DTO alone (`ResetPwdDto` only enforces `@MinLength(4)`).
4. Missing recovery info (`recoveryCode && recoveryCodeExpiration && recoveryToken`) →
   `BadRequestException('Usuario fuera de proceso.')`.
5. **Token binding:** `user.recoveryToken !== resetToken` →
   `UnauthorizedException('Token inválido para esta acción.')`. A leaked/short-lived
   token cannot be replayed against another user.
6. `updatePasswordOnRecoveryProcess(user.id, newPwd)` then returns
   `SessionService.createSession(user, userAgent, ip)` — the new credentials
   immediately produce a session.

### `generateRecoveryCode(): string`

Public for testing; returns a `AAA-######` code using `randomInt` from `node:crypto`.

## Integration

| Consumer | Usage |
|---|---|
| `PwdRecoveryController` | `POST /api/auth/pwd-recovery/code` (step 1), `POST /api/auth/pwd-recovery/validate` (step 2), `POST /api/auth/pwd-recovery/reset-password` (step 3, behind `ResetPwdGuard`) |
| `ResetPwdGuard` | Verifies the step-2 token with `JWT_RESET` + `purpose` and injects `user.email` into the request before `updatePwd` |

## Security considerations and edge cases

- **CSPRNG:** codes are always generated with `node:crypto.randomInt` — never
  `Math.random()`.
- **Password policy:** the strength regex is enforced server-side in the service;
  the controller DTO cannot be the only gate.
- **Account enumeration (known limitation):** `findByEmailOrThrow` raises
  `NotFoundException` (built-in) in step 1 when the email does not exist, while
  `createRecoveryCode` converts auth-specific conditions to `403`. An attacker can
  thereby distinguish valid accounts in non-prod diagnostics. This behavior is
  deliberate for now to keep operator feedback; if `isProd` gating the code in the
  body becomes insufficient, replace the not-found path with a generic message.
- **Deliberate TOCTOU:** `UserService.update` in step 1 writes on top of whatever
  the loaded user row holds; no optimistic-concurrency fields are used (same pattern
  as the rest of the module).
- Recovery codes and the reset token are state persisted on the user and reset
  by `updatePasswordOnRecoveryProcess`.

## Test coverage

- `apps/api/src/auth/services/pwd-recovery.service.spec.ts` (16 cases)
- Covers: success + code format (`AAA-######`); inactive neighborhood; **missing
  neighborhood (Forbidden, no write)**; SUPERADMIN bypass; inactive user; unknown
  code; expired code; **missing expiration (BadRequest)**; reset token issuance and
  persistence; non-recovery status; incomplete recovery info; **weak password
  (BadRequest, no write)**; token mismatch (Unauthorized); full success path with
  session creation; CSPRNG code-format fuzz (50 iterations).