# OnboardingService

`apps/api/src/administration/user/services/onboarding.service.ts`

Computes onboarding progress and finalizes it by activating the user.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<User>` | Load the user with `role`, `status`, `userUnits` and `profile` |
| `CatalogsService` | Resolve the `ACTIVE` `UserStatus` |

## Public Methods

### `getOnboardingStatus(publicId): Promise<OnboardingStatusResponseDto>`

Loads the user (with `role`, `status`, `userUnits`, `profile`) or throws `NotFoundException`.

Derived flags:
- `requiresUnitCreation` = `user.isFirstAdmin`.
- `hasUnits` = `user.userUnits.length > 0`.
- `isSecurityCompleted` = `!user.requirePwdChange`.
- `isProfileCompleted` = first name, last name and phone present (null-safe on `profile`).
- `isUnitCompleted` = `!requiresUnitCreation || hasUnits`.
- `isCompleted` = status is `ACTIVE` **or** (not requiring a unit, security completed and profile completed).

Steps returned (labels are user-facing and kept in Spanish):
1. `WELCOME` — completed when security is completed.
2. `SECURITY` — completed when the password was changed.
3. `GENERAL_FORM` — completed when the profile is filled.
4. `CREATE_UNIT` — only for the initial admin; completed when units exist.
5. `COMPLETE` — completed when security, profile and unit steps are done.

`currentStepId` is the first pending step, or `COMPLETE` when all are done.

### `completeOnboarding(userId): Promise<void>`

Resolves the `ACTIVE` status and updates the user's `statusId`.

## Bug Fixes (this revision)

- **Proper not-found error**: previously threw a plain `Error('User not found')` (500); now throws `NotFoundException`.
- **Null-safe profile**: `user.profile?.firstName/...` prevents a crash when the profile relation is missing.
- Comments translated to English.
