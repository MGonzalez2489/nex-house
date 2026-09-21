# ResidentFilters (web)

Search bar embedded in the residents table header/filters area.

- **File:** `apps/web/src/app/features/residents/components/resident-filters/resident-filters.ts`
- **Template:** `resident-filters.html` (standalone, `OnPush`)
- **Outputs:** `filter: OutputEmitterRef<SearchUser>`

## Inputs

| Input | Type | Description |
|---|---|---|
| `roles` | `BaseCatalogModel[]` | User role catalog for the role select |
| `statuses` | `BaseCatalogModel[]` | User status catalog for the status select |

## Behavior

- Builds a `FormGroup` with three controls: `globalFilter`, `role`, `status`.
- Emits `filter` when any control changes:
  - `valueChanges` is piped through `distinctUntilChanged` with a field-by-field
    comparator (`globalFilter`, `role`, `status`) and `debounceTime(300)` so
    object-reference-noop dedup is avoided.
  - The subscription is registered with `takeUntilDestroyed(this.destroyRef)`,
    so component teardown unsubscribes automatically (no leak).
- Pressing Enter submits the form: `onFormSubmit` calls `preventDefault()` and
  emits the current value immediately **without** re-debouncing.
- Every emission resets `first: 0` so a filter change jumps back to page one
  instead of keeping a stale offset from a previous page.
- Role/status values use the catalog `name` (`optionValue="name"`), which matches
  the API contract (`role.name = :role`, `status.name = :status`).

## Emitted payload

```ts
{ first: 0, globalFilter?: string, role?: string, status?: string }
```

`residents-table` forwards it to `paginate` → the home page merges it into its
`loadAll` filters.

## A11y

- The search input has an `aria-label`.
- Role/status selects are hidden on small screens (`hidden sm:block`) to avoid a
  cramped mobile header; the text search remains always visible.

## Test coverage

- `apps/web/src/app/features/residents/components/resident-filters/resident-filters.spec.ts`
- Covers: debounced emission with `first: 0`, empty-string normalization,
  `takeUntilDestroyed` cleanup and Enter submission.