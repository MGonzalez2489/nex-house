# ResidentsTable (web)

Presentational table + mobile card list for the residents feature.

- **File:** `apps/web/src/app/features/residents/components/residents-table/residents-table.ts`
- **Template:** `residents-table.html` (standalone, `OnPush`)
- **Outputs:** `paginate: OutputEmitterRef<Partial<SearchUser>>`, `view: OutputEmitterRef<string>`

## Inputs

| Input | Type | Description |
|---|---|---|
| `items` | `UserModel[]` (required) | Residents to render |
| `pagination` | `ApiPaginationMeta` | Server pagination meta (`total`, `page`, `lastPage`, `limit`) |
| `isLoading` | `boolean` | Loading state for the p-table |
| `isMobile` | `boolean` | When true renders the mobile card list instead of the table |
| `roles` / `statuses` | `BaseCatalogModel[]` | Catalogs forwarded to `ResidentFilters` for the role/status selects |

## Behavior

- **Desktop:** `p-table` with lazy loading. The grid is shown only when
  `pagination() && items().length > 0` (the duplicated `[paginator]` binding was
  fixed to a single source-of-truth expression) and the header row is hidden when
  the table is empty. `showFirstLastIcon` is bound with the boolean binding
  `[showFirstLastIcon]="false"`.
- **Mobile:** `@for (user of items(); track user.publicId)` renders an
  accessible card (avatar, name, email, status tag, role) that emits `view` on
  click, with an `@empty` empty state and a `p-paginator` footer.
- Both `search(event: TableLazyLoadEvent)` and `paginateMobile(event)` emit
  `{ first, rows }` through `paginate`; `filter(event)` forwards the whole
  `SearchUser` (including `first: 0` resets from the filters).
- The status tag is rendered only when `user.status` is present
  (`@if (user.status; as status)` in both desktop and mobile views), because
  `ResidentStatusComponent.status` is a required input and `UserStatusModel` is
  optional on the model.
- The row action button carries an `aria-label` with the resident name/email.
- `user.role?.displayName ?? '--'` guards against residents without a role.

## Emitted payloads

`paginate` → `{ first?, rows?, globalFilter?, role?, status? }` (filter merges
into the same payload). `view` → the resident `publicId`.

`neigh-form` note: navigation to the edit screen is handled by the home page.

## Test coverage

- `apps/web/src/app/features/residents/components/residents-table/residents-table.spec.ts`
- Covers: rendering desktop/mobile variants, empty state, `paginate` (lazy load
  + mobile) and `view` output emissions.