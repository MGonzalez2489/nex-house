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
| `totalRegistered` | `pagination()?.total ?? entries().length` (no longer rendered: the counter chip was dropped with the `app-page-header` migration) |

## Template

- The header is the shared `app-page-header` with a `Fraccionamientos` title and
  a `subTitle` (hidden on mobile by the component).
- **The `{total} registrados · {active} activos` counter chip was removed** when
  the page was migrated to `app-page-header`, because the component exposes only
  `title` / `subTitle` and has no slot for a chip beside the title. The
  `totalRegistered` / `activeEntries` signals still exist in the component and
  remain available if a `#titleMeta` slot is ever added. If the counter is
  wanted back, add that slot rather than re-inlining the header markup.
- Two `p-button`s are **projected** as content into the header's actions row:
  - "Nuevo" (`icon="pi pi-plus"`, `hidden md:block`).
  - A text search icon (`hidden md:hidden`) for mobile.
  Both nodes are always present, so the actions row is never `:empty`; on mobile
  only the icon shows, which keeps the title's 50% cap a sensible trade-off.
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