# NeighHomePage (web)

Landing page listing neighborhoods with search, pagination and create actions.
It owns the filter state: applied filters for the desktop table and a draft for
the mobile bottom sheet.

- **File:** `apps/web/src/app/features/neighborhoods/pages/neigh-home-page/neigh-home-page.ts`
- **Template:** `neigh-home-page.html` (standalone)
- **Tests:** `neigh-home-page.spec.ts` (13 tests)

## Dependencies

| Dependency | Usage |
|---|---|
| `NeighborhoodsStore` | `loadAll(filters)`, `entities()`, `pagination()`, `loading()`, `error()`, `callState()` |
| `SessionService` | `isMobile()` — no longer forwarded to the table, which injects it itself |
| `FormFeedback` (`@shared/components/forms`) | Error banner |
| `PageHeader`, `FilterSheet` (`@shared/components`) | Page title row, mobile filter bottom sheet |
| `NeighTableFilters` | Filter form, rendered twice (inline desktop + inside the sheet) |

## Filter state

| Signal | Type | Purpose |
|---|---|---|
| `filters` | `signal<SearchNeigh>({})` | Applied filters — what the table is showing |
| `draft` | `signal<SearchNeigh>({})` | Uncommitted edits made inside the sheet |
| `sheetOpen` | `signal(false)` | Visibility of the bottom sheet |
| `hasPendingChanges` | `computed<boolean>` | `JSON.stringify(draft) !== JSON.stringify(filters)`; disables "Aplicar" |

`NeighborhoodsStore.loadAll(filters)` does not retain filters, so the page is the
single source of truth and seeds both filter instances from it.

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
  remain available if a `#titleMeta` slot is ever added.
- Two `p-button`s are **projected** as content into the header's actions row:
  - "Nuevo" (`icon="pi pi-plus"`, `hidden md:block`) → `onCreate()`.
  - A text search icon (`md:hidden`, `aria-label="Filtrar fraccionamientos"`)
    → `openFilters()`.
  Both nodes are always present, so the actions row is never `:empty`; on mobile
  only the icon shows, which keeps the title's 50% cap a sensible trade-off.
- **The mobile search icon used to call `onCreate()`**, which navigated to the
  create form instead of filtering. It now opens the filter sheet; creating on
  mobile is the FAB's job.
- Error feedback rendered **only** when `neighStore.error()` is truthy as
  `<app-form-feedback [callState]="neighStore.callState()" />`.
- `<app-neighborhoods-table>` wired with `[items]`, `[pagination]`, `[isLoading]`,
  `[filters]` and the `(paginate)`/`(view)` outputs. `[isMobile]` is gone — the
  table reads the viewport from `SessionService`.
- `<app-filter-sheet title="Filtros">` holds the mobile filter form:
  - body → `<app-neigh-table-filters [value]="draft()" [debounceMs]="0" (filter)="draft.set($event)" />`
  - footer → "Limpiar" (`clearDraft()`) and "Aplicar" (`applyFilters()`,
    `flex-1`, disabled while `hasPendingChanges()` is false).
- Responsive FAB: `absolute right-4 bottom-4 md:hidden`, `rounded size="large"`,
  `aria-label="Registrar nuevo fraccionamiento"`.

## Actions

| Method | Behavior |
|---|---|
| `onCreate()` | Navigates to `HOME/NEW` |
| `onSearch(filters)` | Stores the applied filters and calls `neighStore.loadAll(filters)`. Fired by the table's lazy load, the inline debounced filters and both paginators. |
| `onView(id)` | Navigates to `HOME/:id` |
| `openFilters()` | Seeds `draft` from `filters` and opens the sheet |
| `applyFilters()` | Closes the sheet and `onSearch(draft)` |
| `clearDraft()` | Empties the draft **without** closing the sheet or reloading |
| `onSheetClosed()` | Resets `sheetOpen` on any dismissal |

Typing in the sheet only mutates `draft`; the list reloads on "Aplicar" only.

> Note: the first load is driven by the table's `lazyLoadOnInit`, not by this
> page directly — keep that contract when restructuring the table.
