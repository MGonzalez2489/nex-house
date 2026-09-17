# ResidentStatsService

`apps/api/src/administration/residents/services/resident-stats.service.ts`

Aggregated statistics service. Exposes a single method for dashboard-level resident metrics scoped to a neighborhood.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<User>` | Raw query builder for aggregation |

## Methods

### `getStats(neighborhoodId) → Promise<UserStats>`

Returns the following structure:

```ts
interface UserStats {
  summary: { totalUsers: number };
  byRole: Array<{ roleId: number; roleName: string; total: number }>;
  byStatus: Array<{ statusId: number; statusName: string; total: number }>;
}
```

Both `byRole` and `byStatus` use `COUNT` + `GROUP BY` with explicit `INNER JOIN` on `user_role` and `user_status` respectively, scoped to the given `neighborhoodId`.

Empty neighborhoods return `{ summary: { totalUsers: 0 }, byRole: [], byStatus: [] }`.

## Key Bug Fixes (this revision)

- **Data-leak fix in status query**: the `byStatus` aggregation was missing `andWhere('user.neighborhoodId = :neighborhoodId')`, causing it to count ALL statuses across every neighborhood. Both queries now consistently filter by `neighborhoodId`.
- **Removed dead `logger`** field.
