# NeighTableFilters (web)

Smart-search bar embedded in the neighborhood table header/filters area.

- **File:** `apps/web/src/app/features/neighborhoods/components/neigh-table-filters/neigh-table-filters.ts`
- **Template:** `neigh-table-filters.html` (standalone)
- **Outputs:** `filter: OutputEmitterRef<SearchNeigh>`

## Behavior

- Builds a `FormGroup` with a single `hint` `FormControl`.
- Emits `filter` when the `hint` value changes:
  - `valueChanges` is piped through `distinctUntilChanged` (same-value
    comparator) and `debounceTime(500)`.
  - The subscription lives in `takeUntilDestroyed()` (component-scoped), so
    `ngOnDestroy` cleanup is automatic.
- The form is submitted on Enter via `(ngSubmit)="onFormSubmit($event)"` which
  calls `event.preventDefault()` and emits the current value immediately
  **without** re-debouncing (an Enter while typing fires instantly).
- Empty/identical hints do not re-emit (comparator + `hint` truthiness check in
  the emitter).

## Emitted payload

```ts
{ hint?: string }
```

`neighborhood.table` forwards this to `filter` → the home page merges it into
its `loadAll` filters.

## A11y

- Search input carries `pSize="small"`, `w-full` on mobile and
  `lg:min-w-80` on wider screens.
- `aria-label="Buscar fraccionamiento por nombre o municipio"`.
- The old inactive status `p-button` and disabled `p-selectbutton` blocks were
  removed together with the dead `statusOptions`/`active` control.