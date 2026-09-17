# UserService

`apps/api/src/administration/user/services/user.service.ts`

Transactional service for user updates, password changes and password-recovery state.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<User>` | Direct lookups/updates outside transactions |
| `DataSource` | QueryRunner creation for the update transaction |
| `CatalogsService` | Resolve `UserRole`, `UserStatus`, `UnitType`, `UnitStatus` and `UserUnitRole` catalogs (throws `NotFoundException` when missing) |
| `CryptoService` | Password hashing and comparison |
| `UserSearchService` | Reload the persisted user with relations |

## Public Methods

### `update(neighId, userPublicId, dto, currentUser): Promise<User>`

Updates a user inside a **single transaction**.

Flow:
1. Load the user scoped to `publicId` + `neighborhoodId` (falls back to `IsNull()` when `neighId` is null); `NotFoundException` otherwise.
2. Resolve and stage a new role when `dto.userRoleId` differs from the current one.
3. Validate the recovery payload pair: providing `recoveryCode` without `recoveryCodeExpiration` (or vice versa) throws `BadRequestException`.
4. When both recovery fields are present, store them and switch the user status to `PASSWORD_RECOVERY`. A token-only payload (`recoveryToken`) is stored without wiping the step-1 data.
5. Inside the transaction: save the user, then optionally resolve the target unit:
   - `unitId` → load the unit scoped to the neighborhood (`NotFoundException` if not in scope).
   - `unitIdentifier` → require `streetId` + `unitTypeId`, load the street scoped to the neighborhood (`NotFoundException`), resolve `UnitType` and `UnitStatus` (`OCCUPIED`, since the user is assigned), and create the unit.
   - Resolve `UserUnitRole` (`findByPublicId`).
   - Deactivate the user's previous active allocations when `isCurrentOccupant`.
   - Create and save the `UserUnit` assignment (uses the `userUnitRole` relation).
6. Commit and reload the user with `status` + `role`.

`ConflictException`, `BadRequestException` and `NotFoundException` are rethrown as-is; any other error is rolled back and wrapped in `InternalServerErrorException`. The QueryRunner is always released.

### `changePassword(publicId, oldPassword, newPassword): Promise<boolean>`

Returns `false` (without throwing) when the user is missing, the new password equals the old one, or the old password does not match. On success it hashes the new password, sets `requirePwdChange = false` and saves the user.

### `updatePasswordOnRecoveryProcess(id, newPwd): Promise<void>`

Hashes `newPwd`, resolves the `ACTIVE` status and updates the user, clearing `recoveryCode`, `recoveryCodeExpiration` and `recoveryToken`.

### `cleanPwdRecoveryState(id): Promise<void>`

Restores the `ACTIVE` status and clears the recovery fields. Used when a user logs in successfully while a recovery was in progress.

## Private Helpers

### `resolveTargetUnit(queryRunner, neighId, dto, currentUserId): Promise<Unit>`

Resolves the unit referenced by an update payload, either loading an existing unit or creating a new one (with `typeId`, `statusId` and audit `createdBy`) inside the neighborhood.

## Bug Fixes (this revision)

- **Recovery validation status code**: an incomplete recovery payload now throws `BadRequestException` (400) instead of `InternalServerErrorException` (500), since it is a malformed request, not a server fault.
- **Cross-neighborhood unit assignment blocked**: the `unitId` and `streetId` lookups are now scoped by `neighborhoodId`; previously a user could be linked to a unit (or street) from another neighborhood.
- **Unit creation crash fixed**: the `unitIdentifier` branch created units without `typeId`/`statusId` (non-nullable columns), which failed at insert time. The branch now requires `unitTypeId` and resolves `UnitType` + `UnitStatus`.
- **`NotFoundException` no longer swallowed**: catalog lookups that throw `NotFoundException` are rethrown instead of being converted into an opaque 500.
- **Removed `restorePwd`** and the dead commented-out `activeUserStatus` block.
- **Log message cleaned** (removed emoji) and the unused `Nullable`-style patterns replaced with explicit narrowing for the unit payload.
