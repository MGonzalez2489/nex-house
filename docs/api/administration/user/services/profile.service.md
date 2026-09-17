# ProfileService

`apps/api/src/administration/user/services/profile.service.ts`

Reads and updates `UserProfile` records, including avatar uploads.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<UserProfile>` | Profile persistence and phone uniqueness checks |
| `UserSearchService` | Resolve the owner user by `publicId` and load its profile |
| `StorageService` | Persist uploaded avatar files |
| `ConfigService` | Resolve `UPLOAD_DIR` for avatar paths |

## Public Methods

### `getByUserId(userId): Promise<UserProfile | null>`

Loads the profile owned by a user including the `avatar` relation.

### `update(publicId, dto, avatar?): Promise<UserProfile | null>`

1. Loads the owner user with `profile` (`findByPublicIdOrThrow`) and throws `NotFoundException` when the profile is missing.
2. Trims and applies `firstName` / `lastName`.
3. For `phone`: formats it, validates the format (`BadRequestException`), rejects duplicates (`ConflictException`) and assigns it.
4. For an avatar: builds the avatar path from `UPLOAD_DIR`, uploads it and stores the resulting file id.
5. Persists the profile and returns the reloaded one.

## Bug Fixes (this revision)

- **Null profile guard**: previously `profile.firstName = ...` crashed with a `TypeError` when the user had no profile; it now throws `NotFoundException`.
- **Typo fixed**: `formatedPhone` → `formattedPhone`.
- **Explicit return types** added to both methods.
- Removed the unused `Logger` instance.
