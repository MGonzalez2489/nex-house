# UnitService

`apps/api/src/administration/units/services/unit.service.ts`

Transactional service for unit creation, with optional initial occupant assignment.

## Dependencies

| Token | Purpose |
|---|---|
| `CatalogsService` | Resolve `UnitType`, `UnitStatus` and `UserUnitRole` catalogs (throws `NotFoundException` when missing) |
| `NeighStreetService` | Resolve the target `NeighStreet` by `publicId` (returns `null` when missing) |
| `DataSource` | QueryRunner creation for the creation transaction |

## Public Methods

### `create(neighId, dto, currentUserId): Promise<Unit>`

Creates a unit inside a **single transaction**, optionally assigning a user.

Flow:
1. Validate required fields (`unitIdentifier`, `unitTypeId`, `streetId`); throw `BadRequestException` if missing.
2. Require `unitRoleId` when `dto.userId` is present; throw `BadRequestException` otherwise.
3. Sanitize the identifier (trim + uppercase, `A-Z0-9-` only) via `validateAndSanitizeUnitIdentifier`.
4. Resolve status: `OCCUPIED` when assigning a user, otherwise `VACANT`.
5. Resolve dependencies in parallel: `UnitType` (`findByPublicId`), `NeighStreet` (`findByPublicId`, nullable), `UnitStatus` (`findByName`) and, only when assigning, `UserUnitRole`.
6. Reject when the street is missing or does not belong to `neighId` (`BadRequestException`).
7. Inside the transaction: check identifier uniqueness scoped to neighborhood + type + street (`ConflictException`), create and save the `Unit`.
8. When `dto.userId` is set: load the user scoped to the neighborhood (`NotFoundException` if not found), create the `UserUnit` assignment (with the `userUnitRole` relation and `isCurrentOccupant`, defaulting to `true`).
9. Commit and return the saved `Unit`.

## Private Helpers

### `validateAndSanitizeUnitIdentifier(value): string`

Trims, uppercases and validates the identifier against `/^[A-Z0-9-]+$/`. Throws `BadRequestException` when empty or containing forbidden characters.

## Bug Fixes (this revision)

- **Invalid `roleId` column removed**: the `UserUnit` assignment set a non-existent `roleId` property; it now sets only the `userUnitRole` relation (mapped to the real `userUnitRoleId` column).
- **Null-safety on `userUnitRole`**: assigning a user without a valid unit role previously crashed with a `TypeError` (`userUnitRole.id` of null) that surfaced as a 500. It now throws a clean `BadRequestException` before the transaction.
- **Street null-safety + neighborhood scoping**: `NeighStreetService.findByPublicId` returns `null` when missing and is not neighborhood-scoped; the service now throws `BadRequestException` when the street is absent or belongs to another neighborhood, preventing cross-neighborhood unit creation.
- **Dead commented-out DTO block removed** from the end of the file.
- **Log message cleaned** (removed emoji) and JSDoc updated to reflect the new validation rules.
