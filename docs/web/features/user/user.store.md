# UserStore (web)

`@ngrx/signals` root store that owns the authenticated user's own account data
(the "profile" feature). It is the single source of truth for `user`, `profile`,
`status`, `role` and `units` slices used by the layout, session, onboarding and
profile page.

- **File:** `apps/web/src/app/features/user/user.store.ts`
- **Injected in:** `withDevtools('user')`, `withReset()`, `withCallState()`.
- **Consumed by:** `profile-home-page`, `StartupStore`, `SessionService`,
  `OnboardingStore`, `onboarding-home-page`, `ShellResolver`,
  `onboardingRequiredGuard`, `MainLayout`.

## State

| Field | Type | Description |
|---|---|---|
| `user()` | `UserModel \| undefined` | Authenticated user without the `status`, `role` and `userUnits` payload keys |
| `profile()` | `UserProfileModel \| undefined` | Public profile (`firstName`, `lastName`, `phone`, `avatar`) |
| `status()` | `UserStatusModel \| undefined` | Status slice normalized from `GET /api/user` |
| `role()` | `UserRoleModel \| undefined` | Role slice normalized from `GET /api/user` |
| `units()` | `UserUnitModel[]` | Unit assignments normalized from `GET /api/user` |
| `loading()` / `loaded()` / `error()` | `CallState` | `withCallState` lifecycle signals |

## Methods

### `loadProfile(): Promise<boolean>`

Calls `ProfileService.get()` (`GET /api/user/profile`) and stores `profile`.
Returns `true` on success; on failure patches `setError` and returns `false`.

### `loadUser(): Promise<boolean>`

Calls `UserService.get()` (`GET /api/user`) and **normalizes** the response
without mutating it: `status`, `role` and `userUnits` are destructured out of the
payload into their own state slices, while `user` keeps the remaining fields
(including `neighborhood`, which the API now loads). Returns `true` on success;
on failure patches `setError` and returns `false`.

`loadUser`/`loadProfile` are driven externally by `StartupStore.initializeApp()`
on bootstrap (and by the onboarding flow after profile/unit updates); the page
does not trigger them.

### `update(dto: ProfileEditPayload): Promise<boolean>`

Patches the profile via `ProfileService.update(dto)`
(`PATCH /api/user/profile`, multipart carrying the changed text fields and, when
present, the `avatar` file) and stores the returned profile on success. `dto` is
the typed diff emitted by `ProfileFormComponent` (`@core/models/
profile-edit-payload`) — it only contains fields the user actually changed, so an
empty object means nothing to send. Returns `true` on success; on failure
patches `setError` and returns `false`.

> All methods return `Promise<boolean>` so pages and flows can branch on success
> without reading `error()`.

### Hooks

`onInit` subscribes an `effect` to `AuthStore.isAuthenticated()`: when the user
logs out the store is reset (`store.resetState()`) so the profile data does not
leak across sessions.

## Notes

- The store used to mutate the API payload (`delete user.status`, `user.userUnits
  = []`); normalization now uses destructuring so the received object is never
  mutated.
- `GET /api/user` loads `status`, `role`, `neighborhood` and `userUnits`
  relations; `neighborhood` arrives as `null` for users without one (root user).

## Test coverage

- `apps/web/src/app/features/user/user.store.spec.ts`
- Covers `loadProfile`, `loadUser` (slicing without mutating the payload,
  success/error paths), `update` (success/error) and `resetState`.