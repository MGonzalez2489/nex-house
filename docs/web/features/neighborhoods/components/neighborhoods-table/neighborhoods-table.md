# NeighborhoodsTable (web)

Container that renders the neighborhood list with a desktop table and a mobile
card feed.

- **File:** `apps/web/src/app/features/neighborhoods/components/neighborhoods-table/neighborhoods-table.ts`
- **Template:** `neighborhoods-table.html` (standalone)
- **Tests:** `neighborhoods-table.spec.ts` (13 tests)

## Inputs

| Input        | Type                             | Description                                                      |
| ------------ | -------------------------------- | ---------------------------------------------------------------- |
| `items`      | `NeighborhoodModel[]` (required) | Entities to render                                               |
| `pagination` | `ApiPaginationMeta \| undefined` | Pagination meta (drives paginator + reports)                     |
| `isLoading`  | `boolean`                        | Passed to `p-table [loading]`                                    |
| `filters`    | `SearchNeigh`                    | Applied filter state owned by the page; seeds the inline filters |

`isMobile` is **no longer an input**. See
[Viewport source of truth](#viewport-source-of-truth).

## Outputs

| Output     | Payload                                                          | Description                             |
| ---------- | ---------------------------------------------------------------- | --------------------------------------- |
| `paginate` | `Partial<SearchNeigh>` `{ first, rows }` or a full `SearchNeigh` | Pagination **or** filter change request |
| `view`     | `string` (publicId)                                              | Open the details page                   |

## Viewport source of truth

The component injects `SessionService` and reads `isMobile` from it:

```ts
private readonly sessionService = inject(SessionService);
protected readonly isMobile = this.sessionService.isMobile;
```

`SessionService.getViewSize()` classifies `width < 768` (Tailwind `md`) as
`"small"`, so the signal and the `md` CSS breakpoint agree at 768px.

This replaced an `input<boolean>(false)` default, which was a silent failure
mode: a page that forgot `[isMobile]="…"` let CSS hide the desktop table while
the mobile cards were never rendered, leaving a **blank screen on phones**. The
breakpoint that hides the table is now something a consumer cannot forget to
wire. The component is still presentational — `SessionService` is a UI service,
not a domain store.

The desktop table is still kept in the DOM (hidden with `hidden md:block`) and
the mobile feed is still rendered by `@if (isMobile())`. Both branches are not
rendered at once, because `p-table` has `lazyLoadOnInit` and a second instance
would trigger an extra load.

## Desktop (md+)

`p-table` wired in lazy mode:

- `lazy` + `lazyLoadOnInit` — the table triggers the initial `onLazyLoad` on
  mount, which the home page depends on for the first `loadAll` call.
- Columns: avatar, `Nombre`, street count, `Estatus`, detail action. Header
  cells use `scope="col"` and Tailwind fraction widths (no inline styles).
- The detail `p-button` is labeled with `aria-label="Ver detalle de {name}"`.

## Mobile (default)

The visible feed is a list of tappable cards:

- Each card is a full-width `<button>` showing avatar, capitalized name,
  `city, state`, a chevron, the `NeighStatusTag` and a street-count line.
- Cards use the project `slate` palette, rounded borders and a visible custom
  focus outline (`focus-visible:outline … blue-500`).
- Empty state reuses the desktop empty-message markup in a `@empty` block.
- Pagination is provided by a standalone `p-paginator`
  (`@openng/optimus-ui/paginator`) bound via `pageFirst()`/`pageRows()`
  computeds and fired through `paginateMobile($event)` with the same
  `{ first, rows }` contract as the desktop lazy load. `rowsPerPageOptions`
  offers `[10, 20, 50]`.

## Filter wiring

The inline filters are **desktop only**:

```html
@if (!isMobile()) {
<app-neigh-table-filters
  class="w-full md:w-auto"
  [value]="filters()"
  (filter)="filter($event)"
/>
}
```

- On mobile the card stays free of form controls; the filters live in the
  page-level `app-filter-sheet` bottom sheet.
- `[value]="filters()"` seeds the form from the applied state, so the inline bar
  survives a re-render or a filter reset coming from the sheet.
- `(filter)` re-emits through `filter()` → `paginate.emit({ ...event })`, keeping
  one single reload path.
- The bar renders inside the `p-panel` header (via the `nex-card` `#nexHeader`
  slot), next to the `hidden md:block` items report.
- The items report is an `<h2>` with the shared level-2 section style
  (`text-base font-semibold text-slate-900 dark:text-white`), i.e. the same
  treatment `app-nex-card` gives to `headerText`, because it occupies the card
  title slot. It used to be `text-sm text-slate-500` with no weight (400),
  rendering the only "title" of the card weaker than the table header cells.

## A11y / responsiveness

- `scope="col"` headers, labelled icon-only buttons, keyboard-focusable cards.
- No inline `style="..."` in templates.
- The mobile search input in the page header carries
  `aria-label="Filtrar fraccionamientos"`.
