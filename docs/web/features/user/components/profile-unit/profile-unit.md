# ProfileUnit (web)

Read-only panel that lists the units assigned to the authenticated user.

- **File:** `apps/web/src/app/features/user/components/profile-unit/profile-unit.ts`
- **Template:** `profile-unit.html` (standalone, `OnPush`)

## Inputs

| Name | Type | Default | Description |
|---|---|---|---|
| `neighborhood` | `NeighborhoodModel` | `undefined` | Optional neighborhood decoration (`user().neighborhood`) |
| `userUnits` | `UserUnitModel[]` | `[]` | Unit assignments coming from `UserStore.units()` |

## Behavior

- With no assigned units it renders a single "No hay unidad asignada" empty
  state (the old template additionally required `neighborhood` to be set, which
  the API did not return, so the panel was effectively always empty).
- Otherwise it renders the neighborhood name (falling back to an em dash `—`
  when missing) and one row per assigned unit: `street.name + identifier` and the
  `userUnitRole.displayName`, tagging the `isCurrentOccupant` unit with
  "Residencia actual".
- Rows are keyed by `userUnit.publicId` for stable `@for` tracking.

## Test coverage

- `apps/web/src/app/features/user/components/profile-unit/profile-unit.spec.ts`
- Covers: empty state, neighborhood rendering and em-dash fallback, multi-unit
  listing, and current-occupant tagging.