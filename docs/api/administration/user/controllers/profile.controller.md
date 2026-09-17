# ProfileController

`apps/api/src/administration/user/controllers/profile.controller.ts`

Exposes the authenticated user's profile under `user/profile`.

## Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/user/profile` | Returns the mapped profile of the authenticated user |
| `PATCH` | `/user/profile` | Updates the profile (multipart `avatar`) |

## `get(user): Promise<UserProfileModel>`

Loads the profile via `ProfileService.getByUserId(user.id)` and maps it with `UserProfileToModelMapper`. Throws `NotFoundException` when the profile does not exist (previously it crashed inside the mapper).

## `update(dto, user, avatar): Promise<UserProfile | null>`

Delegates to `ProfileService.update(user.publicId, dto, avatar)`.

## Security fix (this revision)

- **Removed the public password-reset backdoor**: the `GET /user/profile/resetpwd` endpoint annotated with `@Public()` reset the caller's password to a hard-coded value (`1234`) and was only reachable unauthenticated (leaving `@CurrentUser()` undefined and crashing). The endpoint and its `UserService.restorePwd` dependency were removed, along with the now-unused `UserService` injection and `Public` decorator import.
