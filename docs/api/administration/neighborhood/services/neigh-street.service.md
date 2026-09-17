# NeighStreetService

CRUD data-access service for `NeighStreet` records owned by a neighborhood.
Supports bulk create/update/remove flows and transparently joins an external
transaction when a `transactionalManager` is supplied.

- **File:** `apps/api/src/administration/neighborhood/services/neigh-street.service.ts`
- **Injectable:** Yes (`@Injectable`), Nest singleton.
- **Exposed via:** `neighborhood.module.ts` providers; barrel `apps/api/src/administration/neighborhood/services/index.ts`.

## Dependencies

| Dependency | Usage |
|---|---|
| `Repository<NeighStreet>` (TypeORM) | `createQueryBuilder`, `findOneBy`, `save`, `softRemove` |
| `paginateQuery` (`@core/utils`) | Street listing pagination for `findAll` |
| `Brackets`, `In` (TypeORM) | Multi-term name filtering / bulk id lookups |

## Public contract

### `createMany(streets, createdBy, transactionalManager?): Promise<NeighStreet[]>`

- Builds `NeighStreet` entities from `{ name, neighborhoodId }[]`, stamping
  `createdBy`.
- Uses `transactionalManager ?? streetRepo.manager`, so the inserts join the
  caller's transaction when a manager is supplied.

### `update(publicId, name, updatedBy): Promise<NeighStreet>`

- Loads the row by public UUID; throws `NotFoundException` if missing.
- Normalizes the name (`trim().toLocaleLowerCase()`), stamps `updatedBy` and saves.

### `updateMany(streets, updatedBy, transactionalManager?): Promise<NeighStreet[]>`

- Accepts `{ id, name }[]`, creates partial entities (id + normalized name +
  `updatedBy`) and saves them in bulk through the (shared) manager — TypeORM
  resolves existing rows by primary key.

### `remove(publicId, deletedBy): Promise<void>`

- Loads the row by public UUID; throws `NotFoundException` if missing.
- Stamps `deletedBy`, saves, then `softRemove` (soft delete).

### `removeMany(ids, deletedBy, transactionalManager?): Promise<void>`

- No-op for an empty `ids` array.
- `find` → `In(ids)`, stamps `deletedBy` on each hit, bulk `save` + `softRemove`.

### `findById(id): Promise<NeighStreet | null>`

Primary-key lookup.

### `findByPublicId(publicId): Promise<NeighStreet | null>`

Public UUID lookup (route-facing key used by the street operations above).

### `findAll(neighborhoodId, filters): Promise<PaginatedResult<NeighStreet>>`

- Base filter: `street.neighborhoodId = :neighborhoodId`.
- Splits `globalFilter` on spaces and ANDs a `LIKE %term%` predicate per
  non-empty term against `street.name`.
- Returns the `paginateQuery` result.

## Internal helpers

### `normalizeName(name): string`

`trim().toLocaleLowerCase()` — applied consistently by `createMany`, `update`
and `updateMany` for uniform, searchable street names.

## Test coverage

- `apps/api/src/administration/neighborhood/services/neigh-street.service.spec.ts`
- Covers: `createMany` (default vs. transactional manager, name normalization),
  `update` (normalization + `NotFoundException`), `updateMany` (bulk partial
  entities), `remove` / `removeMany` (actor stamping, soft removal, empty list
  short-circuit), and `findAll` (term-based filtering, no-filter short-circuit).