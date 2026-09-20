# NeighHomePage (web)

Landing page listing neighborhoods with search, pagination and create actions.

- **File:** `apps/web/src/app/features/neighborhoods/pages/neigh-home-page/neigh-home-page.ts`
- **Template:** `neigh-home-page.html` (standalone)

## Dependencies

| Dependency | Usage |
|---|---|
| `NeighborhoodsStore` | `loadAll(filters)`, `entities()`, `pagination()`, `loading()`, `error()`, `callState()` |
| `SessionService` | `isMobile()` signal forwarded to the table |
| `FormFeedback` (`@shared/components/forms`) | Error banner |

## Computed

| Signal | Expression |
|---|---|
| `entries` | `neighStore.entities()` |
| `activeEntries` | `entries().filter(isActive).length` |
| `totalRegistered` | `pagination()?.total ?? entries().length` (badge counter, not just the loaded page) |

## Template

- Header with `Fraccionamientos` title and a badge `{total} registrados ·
  {active} activos`.
- `p-button` "Nuevo" (desktop, `hidden md:block`).
- Error feedback rendered **only** when `neighStore.error()` is truthy as
  `<app-form-feedback [callState]="neighStore.callState()" />`.
- `<app-neighborhoods-table>` wired with `[items]`, `[pagination]`,
  `[isLoading]`, `[isMobile]` and the `(paginate)`/`(view)` outputs.
- Responsive FAB:
  - Wrapped in a `relative` container.
  - `absolute right-4 bottom-4 md:hidden`, `rounded size="large"`, labeled with
    `aria-label="Registrar nuevo fraccionamiento"`, hidden on md+ where the
    header button takes over.

## Actions

| Method | Behavior |
|---|---|
| `onCreate()` | Navigates to `HOME/NEW` |
| `onSearch(filters)` | `neighStore.loadAll(filters)` (fired by lazy table load + filter debounce + mobile/desktop paginator) |
| `onView(id)` | Navigates to `HOME/:id` |

> Note: the first load is driven by the table's `lazyLoadOnInit`, not by this
> page directly — keep that contract when restructuring the table. The dead
> `isFiltering`/`effect`/`signal` state was removed.