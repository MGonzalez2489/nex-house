# NeighborhoodsTable (web)

Container that renders the neighborhood list with a desktop table and a mobile
card feed.

- **File:** `apps/web/src/app/features/neighborhoods/components/neighborhoods-table/neighborhoods-table.ts`
- **Template:** `neighborhoods-table.html` (standalone)

## Inputs

| Input | Type | Description |
|---|---|---|
| `items` | `NeighborhoodModel[]` (required) | Entities to render |
| `pagination` | `ApiPaginationMeta \| undefined` | Pagination meta (drives paginator + reports) |
| `isLoading` | `boolean` | Passed to `p-table [loading]` |
| `isMobile` | `boolean` | From `SessionService.isMobile()`; switches desktop table → mobile cards |

## Outputs

| Output | Payload | Description |
|---|---|---|
| `paginate` | `Partial<SearchNeigh>` `{ first, rows }` | Re-issued pagination request |
| `view` | `string` (publicId) | Open the details page |

## Desktop (md+)

`p-table` wired in lazy mode:

- `lazy` + `lazyLoadOnInit` — the table triggers the initial `onLazyLoad` on
  mount, which the home page depends on for the first `loadAll` call.
- Columns: avatar, `Nombre`, street count, `Estatus`, detail action. Header
  cells use `scope="col"` and Tailwind fraction widths (no inline styles).
- The detail `p-button` is labeled with `aria-label="Ver detalle de {name}"`.

## Mobile (default)

The `p-table` stays in the DOM but is visually hidden (`hidden md:block`) so
the lazy initial load and pagination state are preserved; the visible feed is a
list of tappable cards (rendered only when `isMobile()`):

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

The filters bar (`NeighTableFilters`) sits in the panel `#icons` slot and its
`filter` output is re-emitted through `filter()` → `paginate.emit({ ...event })`.

## A11y / responsiveness

- `scope="col"` headers, labelled icon-only buttons, keyboard-focusable cards.
- No inline `style="..."` in templates (moved to Tailwind utilities).
- `w-full`/twitch on the search input keeps the toolbar usable on narrow
  screens.