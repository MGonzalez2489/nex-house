# PwdRecoveryController

`PwdRecoveryController` exposes the three public endpoints of the password
recovery flow plus the token-protected final step that issues a new session.

- **File:** `apps/api/src/auth/controllers/pwd-recovery.controller.ts`
- **Scope:** `auth` module
- **Controller prefix:** `auth` (route path below)

## Dependencies

| Dependency | Usage |
|---|---|
| `PwdRecoveryService` | `createRecoveryCode` (step 1), `validateCode` (step 2), `updatePwd` (step 3) |
| `AuthService` | `createCookie` — sets the `refresh_token` cookie with the rotated session |
| `ResetPwdGuard` (+ `ResetTokenPayload`) | Verifies step-3 token; the payload type is imported from the guard |
| `@core/decorators > Public` | Marks all routes as public (default JWT guard skips them) |

## Public contract

### `POST /auth/pwd-recovery-request` (public)

`pwdRecoveryRequest(@Body() dto: PwdRecoveryRequestDto): Promise<RecoveryCodeResponseDto>`

Delegates to `PwdRecoveryService.createRecoveryCode(dto.email)`. Returns the
recovery code only in non-production environments.

### `POST /auth/code-validation` (public)

`codeValidation(@Body() dto: CodeValidationDto): Promise<ResetPasswordTokenDto>`

Delegates to `PwdRecoveryService.validateCode(dto.code)` and returns the
short-lived reset token.

### `POST /auth/reset-password` (`@UseGuards(ResetPwdGuard)`)

`updatePassword(@Body() dto: ResetPwdDto, @Req() request, @CurrentUser() user: ResetTokenPayload, @NestHeaders('user-agent') userAgent, @Res() response): Promise<SessionModel>`

1. Resolves the caller IP: `request.ip ?? x-forwarded-for ?? '0.0.0.0'`.
2. Calls `PwdRecoveryService.updatePwd(user.email, dto.pwd, userAgent, ip, user.token)`.

   > The reset token is taken from the payload injected by `ResetPwdGuard`
   > (`ResetTokenPayload.token`) — the controller no longer re-parses
   > `request.headers.authorization`, keeping a single source of truth for the
   > verified credential.
3. Sets the `refresh_token` cookie via `AuthService.createCookie` and returns the
   new `SessionModel`.

## Route summary

| Method/Prefix | Guard | Delegates to |
|---|---|---|
| `POST /auth/pwd-recovery-request` | public | `PwdRecoveryService.createRecoveryCode` |
| `POST /auth/code-validation` | public | `PwdRecoveryService.validateCode` |
| `POST /auth/reset-password` | `ResetPwdGuard` | `PwdRecoveryService.updatePwd` + `AuthService.createCookie` |

## Test coverage

- `apps/api/src/auth/controllers/pwd-recovery.controller.spec.ts`
- Covers: request-code delegation; code-validation delegation; reset-password
  success (token from `user.token`, cookie set, session returned) and the
  `x-forwarded-for` fallback when `request.ip` is missing.