# ResidentService

`apps/api/src/administration/residents/services/resident.service.ts`

Transactional service for resident lifecycle: create, update role/unit, change/reset password, and avatar upload.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<User>` | User persistence |
| `DataSource` | QueryRunner creation for transactions |
| `CatalogsService` | Look up role/status/unit-type catalog entities by `publicId` or name |
| `CryptoService` | Password hashing (`hash`) and validation (`compare`) |
| `ResidentSearchService` | Final re-fetch after commit (returns fully hydrated entity) |

## Public Methods

### `create(neighId, dto, currentUser): Promise<User>`

Creates a resident with a unit assignment inside a **single transaction**.

Flow:
1. Validate neighborhood scope (`neighId === currentUser.neighborhoodId`); throw `ForbiddenException` otherwise.
2. Check email uniqueness; throw `ConflictException` if duplicate.
3. Resolve `UserRole` via `findByPublicId`, `UserStatus` via `findByName(PENDING_ONBOARDING)` — throw `BadRequestException` if either is missing.
4. Generate default password (`1234` in dev, random in prod).
5. Inside transaction: create User, resolve-or-create Unit (see `resolveOrCreateUnit`), resolve `UserUnitRole`, create `UserUnit` assignment, commit.
6. Re-fetch via `searchService.findByPublicId` with full relations.

### `createFirstAdmin(neighId, email, creator, entityManager): Promise<User>`

Called from `NeighborhoodService` during bootstrap (runs inside the caller's transaction via the injected `entityManager`). Resolves ADMIN role and PENDING_ONBOARDING status, hashes a default password, creates and saves the user.

### `update(neighId, userPublicId, dto, currentUser): Promise<User>`

Updates role and/or unit assignment inside a **transaction**.

- Loads the existing user with `role`, `status`, `userUnits` (with `unit` + `userUnitRole`) relations.
- If `dto.userRoleId` differs from the current role, resolves the new role catalog (throws `BadRequestException` if missing).
- If `dto.unit` is present, delegates to `resolveUnitAssignment` inside the transaction.
- Re-fetches after commit and returns the hydrated entity.

### `changePassword(publicId, oldPassword, newPassword): Promise<boolean>`

Validates the old password, hashes the new one, persists it, and sets `requirePwdChange = false`. Returns `false` if user not found, passwords match, or old password is invalid.

### `restorePwd(userId): Promise<void>`

Resets the user's password to the default value. Throws `NotFoundException` if the user does not exist.

### `updateAvatar(userId, avatar?): Promise<User>`

Stub for avatar upload. Looks up the user (throws `NotFoundException` if missing) and currently re-fetches without persisting. TODO: integrate `StorageService` for blob persistence.

## Private Helpers

### `resolveUnitAssignment(manager, user, unitDto, neighId, currentUser)`

Synchronizes a user's active unit assignment during updates:
1. Resolves the target unit (via `resolveOrCreateUnit`).
2. Resolves `UserUnitRole` catalog (throws `BadRequestException` if missing).
3. **No-op check**: compares the existing active unit assignment's `unit.publicId`, `userUnitRole.publicId`, and `isCurrentOccupant`; skips if unchanged.
4. Soft-removes the old `UserUnit`, creates and saves the new one, and pushes it onto `user.userUnits`.

### `resolveOrCreateUnit(manager, unitDto, neighId, createdBy): Promise<Unit>`

If `unitDto.unitId` is provided, looks up the existing unit in the neighborhood (throws `BadRequestException` if not found).

Otherwise, creates a new unit: resolves `NeighStreet` (scoped to `neighborhoodId`), `UnitType`, and `UnitStatus(OCCUPIED)` — each throws `BadRequestException` if missing. Checks for an existing unit with the same identifier+street+neighborhood before creating.

### `generateDefaultPassword(): Promise<string>`

Returns `cryptoService.hash('1234')` in non-production, or `cryptoService.hash(generateRandomString(10))` in production.

## Key Bug Fixes (this revision)

- **Role/status null guards**: `create` and `createFirstAdmin` now throw `BadRequestException` instead of silently assigning `undefined` as a relation.
- **Unit street scoping**: `resolveOrCreateUnit` filters `NeighStreet` by `neighborhoodId` to prevent cross-neighborhood unit lookups.
- **Unit role null guard**: `resolveUnitAssignment` throws `BadRequestException` if the `UserUnitRole` catalog is not found (was previously a `TypeError`).
- **restorePwd null guard**: throws `NotFoundException` if user not found (was a silent `undefined` password overwrite).
- **updateAvatar null guard**: throws `NotFoundException` if user not found.
- **`formattedEmail` typo**: renamed from `formatedEmail`.
- **`avatar` unused-param lint**: eslint-disable comment added with TODO explaining the stub status.
