# JwtStrategy

`JwtStrategy` is the passport `jwt` strategy that backs `JwtAuthGuard`: it reads
the bearer access token, verifies its signature/expiration, and resolves the
subject user before a protected request proceeds.

- **File:** `apps/api/src/auth/strategies/jwt.strategy.ts`
- **Scope:** `auth` module — instantiated by passport when `JwtAuthGuard` (global `APP_GUARD`) runs
- **Extends:** `PassportStrategy(Strategy)` (`passport-jwt`)
- **Injectable:** Yes (`@Injectable`), Nest singleton (default)

## Dependencies

| Dependency | Usage |
|---|---|
| `ConfigService` (`@nestjs/config`) | Reads `JWT_SECRET`; falls back to `'test-key'` for default/new environments |
| `UserSearchService` (`@administration/user/services`) | Resolves the subject user by email (with `neighborhood`, `role`, `status` relations) |

## Public contract

### `validate(payload: JwtPayload): Promise<User>`

`JwtPayload` = `{ email: string; sub?: string; session?: string }`.

1. **Email claim guard:** a token without `payload.email` is rejected with
   `UnauthorizedException('jwt:Invalid token payload')` — and the lookup is never
   attempted. This is a real safety gate: `findByEmail(undefined)` would strip
   the `undefined` WHERE key in TypeORM and could match an arbitrary (first) user
   instead of failing.
2. Resolves the user via `findByEmail(payload.email, undefined, { neighborhood: true, role: true, status: true })`.
   - `neighborhood` is loaded eagerly; for **root users (`neighborhoodId = null`)** the relation
     simply resolves to `null` (LEFT JOIN). No `IsNull()` is needed in relations —
     `IsNull()` is a *where* filter, not a relation option (see rationale below).
   - `role`/`status` are loaded so the attached `request.user` carries the full
     tenant context.
3. Missing user → `UnauthorizedException('jwt:User not found')`.
4. Returns the `User` entity, which Nest attaches to `request.user` (consumed by
   `@CurrentUser()` and the `NeighborhoodInterceptor`).

## Rationale: root users and the neighborhood relation

- A **relation** (`relations: { neighborhood: true }`) instructs TypeORM to load
  the joined entity. When the FK is `NULL`, the relation is `null` — no error and
  no ambiguity, so no special-case is required for `SUPERADMIN` users.
- `IsNull()` is a **`FindOperator` for the WHERE clause** (e.g.
  `where: { neighborhoodId: IsNull() }`) used to filter which rows are returned.
  It is not a valid value for a relation map and would never appear next to `true`.
- The "non-root users must have a neighborhood" rule is enforced at **login**
  (`AuthService.login`, which throws `ForbiddenException` when a non-root user has
  no/disabled neighborhood and bypasses the gate for `SUPERADMIN`). Duplicating it
  here would also lock misconfigured users out of `logout` (which is protected by
  the same guard), so the strategy only verifies identity.
- Downstream consumers already tolerate `neighborhood: null`: the
  `NeighborhoodInterceptor` keys off the `neighborhoodId` **route parameter**, not
  `user.neighborhood`.

## Notes

- The previous `console.log('securityConfig:', secret)` was removed: it dumped the
  JWT secret into application logs.
- `secretOrKey` defaults to `'test-key'` only when `JWT_SECRET` is unset (existing
  behavior for fresh environments, kept).

## Test coverage

- `apps/api/src/auth/strategies/jwt.strategy.spec.ts` (5 cases)
- Covers: strategy definition; `JWT_SECRET` read; `validate` success (lookup args
  with neighborhood/role/status relations and returned user); missing user →
  Unauthorized; missing `email` claim → Unauthorized **without** querying.