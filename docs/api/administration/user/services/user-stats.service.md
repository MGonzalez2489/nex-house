# UserStatsService

`apps/api/src/administration/user/services/user-stats.service.ts`

Builds neighborhood-scoped user aggregations for dashboards.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<User>` | TypeORM user repository (query builder) |

## Public Methods

### `getStats(neighborhoodId): Promise<UserStats>`

Runs two aggregations in parallel:

1. **By role** — joins `user.role`, excludes `SUPERADMIN`, filters by `neighborhoodId`, groups by `role.name`.
2. **By status** — joins `user.role` and `user.status`, excludes `SUPERADMIN`, filters by `neighborhoodId`, groups by `status.name`.

`totalUsers` is derived from the role buckets. The result is shaped as:

```ts
{
  summary: { totalUsers: number };
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
}
```

## Private Helpers

### `toCountMap(rows, key): Record<string, number>`

Converts raw `SELECT <key>, COUNT(...)` rows into a `label -> count` map, parsing counts with `parseInt`.

## Bug Fixes (this revision)

- **Cross-neighborhood data leak fixed**: the by-status query was missing the `user.neighborhoodId = :neighborhoodId` filter, so it aggregated users from every neighborhood. It is now scoped like the by-role query.
- **Dead `Logger` removed**.
