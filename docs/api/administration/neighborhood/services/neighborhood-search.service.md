# NeighborhoodSearchService

Query-oriented data-access service for `Neighborhood` listings and single-row
lookups. It centralizes the join graph, name/state filters and pagination used
by the neighborhood read endpoints, and is also reused internally to re-fetch
aggregate trees after writes.

- **File:** `apps/api/src/administration/neighborhood/services/neighborhood-search.service.ts`
- **Injectable:** Yes (`@Injectable`), Nest singleton.
- **Exposed via:** `neighborhood.module.ts` providers; barrel `apps/api/src/administration/neighborhood/services/index.ts`.

## Dependencies

| Dependency | Usage |
|---|---|
| `Repository<Neighborhood>` (TypeORM) | QueryBuilder + `findOne` against the `neighborhood` table |
| `paginateQuery` (`@core/utils`) | Applies skip/limit/sort/showAll and builds `PaginatedResult` |

## Public contract

### `findAll(filters, options?): Promise<PaginatedResult<Neighborhood> | Neighborhood[]>`

- Builds a `QueryBuilder` on `neighborhood` that eagerly selects `streets`,
  `address`, `address.city` and `city.state`.
- `globalFilter` → `neighborhood.name LIKE %term%`.
- `isActive` (when not `null`/`undefined`) → `neighborhood.isActive = :isActive`.
- Paginates through `paginateQuery(query, filters)`.
- Returns the paginated wrapper by default; returns `result.data` (raw `Neighborhood[]`) when `options.raw === true`.

### `findByPublicId(publicId, relations?): Promise<Neighborhood | null>`

Single-row lookup by the public UUID; `relations` defaults to `{ streets: true }`.

### `findByName(name, relations?): Promise<Neighborhood | null>`

Single-row lookup by name (used for uniqueness checks during creation).

### `findById(id, relations?): Promise<Neighborhood | null>`

Single-row lookup by internal numeric primary key (used by `GET /neighborhood/mine` when resolving `user.neighborhoodId`).

## Internal helpers

### `findOneByCriteria(criteria, relations?)`

Shared `repository.findOne({ where, relations })` path used by all three scalar
lookups; always applies `relations ?? defaultRelations`.

## Test coverage

- `apps/api/src/administration/neighborhood/services/neighborhood-search.service.spec.ts`
- Covers: paginated default output, `isActive` filtering, global name filter,
  `raw: true` data unpacking, and the three single-row lookups (default vs.
  overridden relations).