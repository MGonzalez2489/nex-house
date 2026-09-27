# ResidentHomePage (web)

Smart page (routed at `"/residents"`) that orchestrates the resident listing,
statistics and navigation.

- **File:** `apps/web/src/app/features/residents/pages/resident-home-page/resident-home-page.ts`
- **Template:** `resident-home-page.html` (standalone, `OnPush`)

## Dependencies

| Token | Purpose |
|---|---|
| `ResidentStore` | `loadStats`, `entities()`, `loading()`, `callState()`, `error()`, `pagination()` |
| `CatalogsStore` | `UserRoles()` / `UserStatus()` fed to the table filters |
| `SessionService` | `isMobile()` to switch table/cards and show the mobile FAB |
| `Router` | navigation |

## Behavior

- `ngOnInit` triggers `store.loadStats()`. The initial list load is driven by the
  table's `[lazyLoadOnInit]` (it emits `paginate` → `onSearch` → `loadAll`).
- `onSearch(filters)` forwards to `store.loadAll(filters)`.
- `create()` navigates to `/residents/new`; `view(id)` navigates to
  `/residents/:id/edit` using array navigation (replaced the fragile
  `.replace(":id", ...)` string manipulation).
- Renders `FormFeedback` with `store.callState()` when `store.error()` is set.
- Header copy typo fixed ("residentes de la plataforma").
- The header is the shared `app-page-header`: `title` + `subTitle` (hidden on
  mobile by the component) with the "Nuevo" button **projected** as content, so
  the button is declared by the page and not by the component.
- The button is projected inside `@if (!sessionService.isMobile())`, so on mobile
  nothing is projected at all: the header's actions row is genuinely empty, it
  collapses via `empty:hidden`, and the title is free to use the full width
  instead of being capped at half the screen for an invisible control. The
  floating "Nuevo" FAB (already gated on `sessionService.isMobile()`) covers
  mobile. On desktop the header row and the FAB do not coexist.

## Test coverage

- `apps/web/src/app/features/residents/pages/resident-home-page/resident-home-page.spec.ts`
- Covers: store wiring (`loadStats` on init), error feedback rendering, and
  `create`/`view`/`onSearch` behavior.