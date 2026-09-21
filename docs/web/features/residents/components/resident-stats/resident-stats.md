# ResidentStats (web)

Presentational stats panel showing aggregated resident KPIs by role and status.

- **File:** `apps/web/src/app/features/residents/components/resident-stats/resident-stats.ts`
- **Template:** `resident-stats.html` (standalone, `OnPush`)
- **Inputs:** `stats: UserStats`

## Input model

```ts
interface UserStats {
  summary: { totalUsers: number };
  byRole: Record<string, number>;    // keyed by role.name
  byStatus: Record<string, number>;  // keyed by status.name
}
```

## Behavior

- Renders nothing until `stats` is provided (`@if (stats(); as stats)`).
- KPI card shows `stats.summary.totalUsers`.
- **By role**: `roleRows()` computed iterates `stats.byRole` and maps each entry
  to a label + dot color from `ROLE_PRESETS` (`UserRoleEnum.ADMIN`,
  `UserRoleEnum.RESIDENT`, `UserRoleEnum.SUPERADMIN`); unknown codes fall back
  to a neutral dot with the raw code as label.
- **By status**: `statusRows()` computed iterates `stats.byStatus` and maps each
  entry to a tag label/severity/icon from `STATUS_PRESETS`
  (`UserStatusEnum.ACTIVE/INACTIVE/PENDING_ONBOARDING/PASSWORD_RECOVERY`), then
  sorts by count descending. Unknown codes fall back to `"secondary"`.
- Both lists render with `@for ... track code` and an `@empty` state.

> This dynamic rendering replaced the previous hard-coded cards. The old markup
> read `stats.byStatus["pending_completion"]` — a key that does not exist in the
> API (statuses are seeded as `PENDING_ONBOARDING`) — so the "Pendiente" figure
> always displayed `0`.

## Test coverage

- `apps/web/src/app/features/residents/components/resident-stats/resident-stats.spec.ts`
- Covers: hidden state without input, KPI/role/status rendering with correct
  counts, empty breakdowns and unknown-code fallbacks.