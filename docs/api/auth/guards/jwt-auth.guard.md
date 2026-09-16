# JwtAuthGuard

`JwtAuthGuard` is the application-wide authentication guard. It is registered
globally (`APP_GUARD`) and delegates token validation to the passport `jwt`
strategy while honoring the `@Public()` opt-out.

- **File:** `apps/api/src/auth/guards/jwt-auth.guard.ts`
- **Scope:** `auth` module — registered as a **global guard** in `apps/api/src/app/app.module.ts` via `APP_GUARD`, so it applies to every route unless marked `@Public()`.
- **Extends:** `AuthGuard('jwt')` (`@nestjs/passport`)
- **Injectable:** Yes (`@Injectable`), Nest singleton (default)

## Dependencies

| Dependency | Usage |
|---|---|
| `Reflector` (`@nestjs/core`) | Reads the `IS_PUBLIC_KEY` metadata from the handler (method) and the controller class |
| `AuthGuard('jwt')` (`@nestjs/passport`) | Runs the passport `jwt` strategy that verifies the bearer access token via `JwtStrategy` |

## Public contract

### `canActivate(context): Promise<boolean>`

1. `reflector.getAllAndOverride(IS_PUBLIC_KEY, [handler, class])` — if the route
   carries `@Public()` at either level, returns `true` immediately and skips the
   JWT strategy entirely.
2. Otherwise delegates to `super.canActivate(context)`.
3. Normalizes the strategy result to a single `Promise<boolean>`:
   - `Observable<boolean>` → `firstValueFrom(result)` (rxjs). Strategy errors
     (rejected streams) propagate as rejected promises.
   - `boolean` / `Promise<boolean>` → `Promise.resolve(result)`.

> The observable branch uses `firstValueFrom` instead of a manual
> `new Promise(subscribe)`, which is the idiomatic rxjs conversion and has the
> same first-value completion semantics.

## Behavior notes

- On failed/invalid/expired access tokens, the passport strategy rejects and the
  framework converts it to `UnauthorizedException`.
- The guard is resolved per-request by Nest and is also used by tools that
  invoke `switchToHttp`, so it should only be applied to HTTP contexts.
- `@Public()` on a controller class automatically marks all its handlers as
  public (e.g. `PwdRecoveryController`).

## Test coverage

- `apps/api/src/auth/guards/jwt-auth.guard.spec.ts`
- Covers: `@Public()` bypass (metadata lookup args); delegation to the passport
  strategy for promises, sync booleans and rxjs observables (`true`/`false`);
  propagation of strategy stream errors; no JWT strategy call on public routes.
  The passport base method is spied (`AuthGuard('jwt').prototype.canActivate`) so
  no real token verification is executed.