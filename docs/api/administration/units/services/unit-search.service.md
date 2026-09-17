# UnitSearchService

`apps/api/src/administration/units/services/unit-search.service.ts`

Read-only service for unit listing and aggregated statistics.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<Unit>` | Query builder for listing and aggregation |

## Methods

### `findAll(filters, neighborhoodId): Promise<PaginatedResult<Unit>>`

Returns a paginated list of units for the neighborhood.

- Query alias `units`, scoped by `units.neighborhoodId = :neighborhoodId`.
- Left joins `street`, `type` and `userUnits` for mapping into `UnitModel`.
- When `filters.globalFilter` is present, applies a `Brackets` group matching `units.identifier OR street.name` with `LIKE %filter%`.
- Pagination/sorting is delegated to `paginateQuery` (from `@core/utils`).

### `findStats(neighborhoodId): Promise<UnitStats>`

Returns:

```ts
interface UnitStats {
  summary: { totalUnits: number };
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byStreet: Record<string, number>;
}
```

Runs three `COUNT` + `GROUP BY` aggregations, all scoped to `neighborhoodId`:
- by status via `innerJoin('unit.status')`, grouped by `status.displayName`
- by type via `innerJoin('unit.type')`, grouped by `type.displayName`
- by street via `innerJoin('unit.street')`, grouped by `street.name`

`summary.totalUnits` is the sum of the status counts. Empty neighborhoods return `totalUnits: 0` and empty maps.

## Notes

- **Status/type keys are `displayName` values** (locale-dependent, e.g. `Ocupado`, `Casa`), because the web stats component renders the keys directly. Street keys use the street `name`.

## Bug Fixes (this revision)

- **Removed unused `logger`** field.
- **Added explicit return type** `Promise<PaginatedResult<Unit>>` to `findAll`.
- **Extracted `toCountMap`** helper to de-duplicate the row-to-dictionary mapping.
- **Spanish comments replaced** with English documentation.
