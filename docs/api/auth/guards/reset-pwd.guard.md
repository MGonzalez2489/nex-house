# ResetPwdGuard

`ResetPwdGuard` protects the `POST /api/auth/reset-password` endpoint (step 3 of
the password-recovery flow). It verifies the short-lived reset token, ensures it
was minted for password recovery (and is not a stolen login token), and injects
the verified payload — plus the raw token — into `request.user` so the handler
does not re-parse the Authorization header.

- **File:** `apps/api/src/auth/guards/reset-pwd.guard.ts`
- **Scope:** `auth` module; applied explicitly via `@UseGuards(ResetPwdGuard)` on `PwdRecoveryController.updatePassword`
- **Implements:** `CanActivate`
- **Injectable:** Yes (`@Injectable`), Nest singleton (default)

## Dependencies

| Dependency | Usage |
|---|---|
| `JwtService` (`@nestjs/jwt`) | `verifyAsync` with the dedicated `JWT_RESET` secret |
| `ConfigService` (`@nestjs/config`) | Reads `JWT_RESET`; absence means the guard refuses to run |
| `@auth/constants > PWD_RESET_PURPOSE` | `'password_reset'` purpose claim check |

## Exported type

```ts
export type ResetTokenPayload = {
  email: string;
  sub: string;
  purpose: string;
  token: string; // the raw verified bearer token
};
```

`PwdRecoveryController` imports this type instead of redeclaring its own, and
consumes `user.token` to identify the reset token server-side (equals the
`recoveryToken` stored on the user).

## Public contract

### `canActivate(context): Promise<boolean>`

1. Reads `Authorization` from the request headers.
2. **Secret gate:** `JWT_RESET` not configured →
   `UnauthorizedException('Reset password secret is not configured')`.
3. **Scheme gate:** only `Bearer <token>` is accepted. Missing header, empty
   token, or any other scheme (e.g. `Basic ...`, `bearer ...`) →
   `UnauthorizedException('Token is required')`. Verification is never attempted
   in these cases.
4. **Verification:** `jwtService.verifyAsync(token, { secret })`. Corrupt/expired
   tokens → `UnauthorizedException('Token expirado o corrupto')`.
5. **Purpose gate (kept outside the `try/catch`):**
   - `purpose !== PWD_RESET_PURPOSE` or missing `email` →
     `UnauthorizedException('Token inválido para esta acción')`.
   - Placement outside the catch is deliberate: previously this validation
     inside the `try` meant its specific message was always swallowed and replaced
     by the generic verification message.
6. On success injects `request.user = { ...payload, token }` and returns `true`.

## Behavior notes

- Verification and purpose validation are two distinguishable failure modes
  surfaced to the client with different messages.
- Attaching the raw token to the injected payload gives the controller a single
  source of truth for the verified credential (the handler used to re-parse
  `request.headers.authorization`, duplicating the parsing logic).
- The guard only checks claims; it does not validate the recovery state of the
  user (that happens in `PwdRecoveryService.updatePwd`).

## Test coverage

- `apps/api/src/auth/guards/reset-pwd.guard.spec.ts`
- Covers: missing secret (no verification attempted); missing header, empty
  token, non-Bearer scheme and lowercase scheme (all `'Token is required'`, none
  calling `verifyAsync`); accepted token injects `{ ...payload, token }`; specific
  purpose/email messages are not swallowed; corrupt/expired token message; user
  not injected on failure.