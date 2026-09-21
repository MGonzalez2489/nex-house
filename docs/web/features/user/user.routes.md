# USER_ROUTES (web)

Lazy routes for the user/profile feature, registered as a child of the private
`MainLayout` route.

- **File:** `apps/web/src/app/features/user/user.routes.ts`

## Routes

| Path | Component | Lazy import |
|---|---|---|
| `""` | `ProfileHomePage` | `./pages/profile-home-page/profile-home-page` |

## Constants

- `USER_ROUTES_ENUM.HOME = "profile"` — the public path under which the feature
  is registered (`apps/web/src/app/app.routes.ts`). The nav-bar user dropdown
  links to `/profile`.

## Notes

- Registered lazily via `loadChildren` under the private parent route that is
  protected by `AuthGuard` + `onboardingRequiredGuard` and resolved by
  `ShellResolver` (which ensures `StartupStore.initializeApp()` runs).
- No `AccessGuard` is applied: the profile page is reachable by any
  authenticated user (`superadmin`, `admin`, `resident`), matching the
  self-scoped `GET /api/user` endpoint.