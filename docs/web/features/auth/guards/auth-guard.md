# AuthGuard (web)

Functional `CanActivateFn` that protects the private application routes.

- **File:** `apps/web/src/app/features/auth/guards/auth-guard.ts`
- **Wired in:** `apps/web/src/app/app.routes.ts` (`canActivate: [AuthGuard]` on
  the `MainLayout` route).

## Behaviour

- Allows navigation (`true`) when `AuthStore.isAuthenticated()` is `true`.
- Otherwise returns a `UrlTree` built from the **absolute** path
  `['/auth', AUTH_ROUTES_ENUM.LOGIN]`, i.e. `/auth/login`.

## Notes

- The guard no longer declares unused `(route, state)` parameters.
- Using an absolute `UrlTree` removes the dependency on the router's current
  context. The previous relative tree (`createUrlTree([LOGIN])` → `/login`)
  only landed on the login page by being caught by the `**` wildcard redirect
  to `/auth/login`.

## Test coverage

- `apps/web/src/app/features/auth/guards/auth-guard.spec.ts`
- Covers: authenticated pass-through, and the unauthenticated redirect asserting
  both the `UrlTree` instance and the serialized `/auth/login` URL.
