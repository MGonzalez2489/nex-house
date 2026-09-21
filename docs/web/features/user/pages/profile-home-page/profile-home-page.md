# ProfileHomePage (web)

Smart page (routed at `"/profile"`) that renders the user's editable personal
information and registered address.

- **File:** `apps/web/src/app/features/user/pages/profile-home-page/profile-home-page.ts`
- **Template:** `profile-home-page.html` (standalone, `OnPush`)
- **Renders:** `ProfileInfoForm`, `ProfileUnit`, `FormFeedback`.

## Dependencies

| Token | Purpose |
|---|---|
| `UserStore` | `user()`, `profile()`, `units()`, `isLoading()`, `callState()`, `error()`, `update()` |

## Behavior

- Builds a single `vm` computed combining `user` and `profile`; the sections only
  render once both are loaded (`@if (vm(); as data)`), which removes the old
  `user()!`/`profile()!` non-null assertions from the template.
- A `neighborhood` computed is derived from `user().neighborhood` and passed to
  `ProfileUnit` (replacing the compiler `$safeNavigationMigration` global that
  was previously referenced in the template).
- Binds `isLoading` and `callState` from the store so `ProfileInfoForm` can show
  the saving spinner and error feedback.
- `(save)` forwards the `FormData` to `UserStore.update`.
- If the data never loads (boot error), `FormFeedback` renders the store error;
  otherwise the page body is empty until `vm` resolves.

## Test coverage

- `apps/web/src/app/features/user/pages/profile-home-page/profile-home-page.spec.ts`
- Covers: sections hidden until data resolves, error feedback on boot failure,
  data/feedback wiring to the sections, and save forwarding to `store.update`.