# onboardingRequiredGuard (web)

Functional `CanActivateFn` that keeps users out of the route that does not match
their current user status (onboarding vs. dashboard).

- **File:** `apps/web/src/app/_core/guards/onboarding-required-guard.ts`
- **Wired in:** `apps/web/src/app/app.routes.ts` (`canActivate` of the
  `MainLayout` shell route and its `onboarding` child route).

## Behaviour

The guard reads the current user status from `UserStore.status()`:

- **Profile not loaded yet** (`status` is `undefined`): returns `true` and lets
  the `ShellResolver` populate the store. This happens right after login, before
  the shell resolver runs (guards are evaluated *before* resolvers). Must never
  return `false` here: that would cancel the navigation, leaving the startup
  splash stuck on `LOADING` with the URL still on `/auth/login`.
- **`PENDING_ONBOARDING`** and the destination is *not* the onboarding route:
  redirects to `/onboarding`.
- **`ACTIVE`** and the destination *is* the onboarding route: redirects to
  `/dashboard`.
- Otherwise: allows navigation.

## Notes

- Redirects are absolute `UrlTree`s (`/onboarding`, `/dashboard`), so the guard
  is independent of the current router context.
- The onboarding redirect for `PENDING_ONBOARDING` users reached through the
  login flow is also handled by `ShellResolver` after `initializeApp()` runs;
  the guard is the defensive layer that applies when the status is already known.
- `ONBOARDING_ROUTES_ENUM.HOME = "onboarding"` and
  `DASHBOARD_ROUTES_ENUM.HOME = "dashboard"`.

## Test coverage

- `apps/web/src/app/_core/guards/onboarding-required-guard.spec.ts`
- Covers: pass-through when the profile is not loaded yet, ACTIVE users entering
  `/dashboard`, PENDING_ONBOARDING users entering `/onboarding`, and both
  redirects (PENDING away from `/dashboard`, ACTIVE away from `/onboarding`)
  asserting the serialized `UrlTree`.