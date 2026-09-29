# NeighTableFilters (web)

Smart-search bar for the neighborhoods table. The component is seeded from the
outside through `value` and reports every change through `filter`, so the
consumer keeps ownership of the filter state.

- **Selector:** `app-neigh-table-filters`
- **File:** `apps/web/src/app/features/neighborhoods/components/neigh-table-filters/neigh-table-filters.ts`
- **Template:** `neigh-table-filters.html` (standalone)
- **Exported from:** `apps/web/src/app/features/neighborhoods/components/index.ts`
- **Tests:** `neigh-table-filters.spec.ts` (13 tests)

## API

| Member | Type | Visibility | Description |
| --- | --- | --- | --- |
| `value` | `input<SearchNeigh>({})` | public | Seed / reset pushed by the parent. Never written back. |
| `debounceMs` | `input<number>(300)` | public | Debounce applied to `filter`. Use `0` to emit synchronously. |
| `filter` | `output<SearchNeigh>()` | protected | Emits the full filter state whenever the form changes. |

## Behaviour

- Single `hint` `FormControl` inside a `FormGroup`, initialised to `''` (not
  `null`) so a pristine form already matches an empty incoming filter and
  initialisation does not emit a spurious change.
- `form.valueChanges` is piped through:
  - `debounce(() => this.debounceMs() > 0 ? timer(this.debounceMs()) : of(undefined))`
    — read **per emission**, so changing `debounceMs` after initialisation takes
    effect immediately, and `0` emits synchronously (no `setTimeout(0)` hop).
  - `distinctUntilChanged((a, b) => a.hint === b.hint)`.
  - `takeUntilDestroyed(this.destroyRef)`.
- The emitted payload spreads the previous state and normalises the hint:

  ```ts
  { ...previous, globalFilter: value.hint || undefined }
  ```

- A constructor `effect()` patches the form whenever `value` changes. It only
  writes when the form actually diverges (`syncHint`), which is what prevents a
  parent-driven change (for example "Limpiar") from bouncing back as a redundant
  user edit. The write is wrapped in `untracked()` so patching the form does not
  re-enter the effect.
- The binding is **one-directional** on purpose: the form owns live editing, the
  parent owns what gets applied. The component never writes to `value`, so no
  write loop is possible.
- Pressing Enter is guarded by `onFormSubmit()` → `event.preventDefault()`; it
  does **not** force an immediate emit.

## No responsive classes

The component carries no `md:`/`lg:` breakpoints — the container decides the
layout. `md:min-w-80` was removed so the same instance can be rendered inline in
the desktop card header and full-width inside the mobile bottom sheet.

## Consumers

| Instance | `[value]` | `[debounceMs]` | `(filter)` | Reloads? |
| --- | --- | --- | --- | --- |
| Desktop, inline in the card | page `filters()` | `300` (default) | `NeighborhoodsTable.filter()` → `paginate` | Yes, debounced |
| Mobile, inside `app-filter-sheet` | page `draft()` | `0` | `draft.set($event)` | No, only on "Aplicar" |

## A11y

- `aria-label="Buscar fraccionamiento por nombre o municipio"`.
- The input is `fluid` and the wrapper is `w-full`.
- Pressing Enter never reloads the page.
