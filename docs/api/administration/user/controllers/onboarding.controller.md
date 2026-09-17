# OnboardingController

`apps/api/src/administration/user/controllers/onboarding.controller.ts`

Drives the onboarding flow for the authenticated user under `onboarding`.

## Endpoints

| Method | Route | Status | Description |
|---|---|---|---|
| `GET` | `/onboarding/status` | 200 | Returns the computed onboarding progress |
| `PATCH` | `/onboarding/security` | 200 | Changes the password and returns the refreshed progress |
| `PATCH` | `/onboarding/profile` | 200 | Updates the profile (multipart `avatar`) and returns the refreshed progress |
| `POST` | `/onboarding/unit` | 201 | Creates the initial unit and returns the refreshed progress |
| `POST` | `/onboarding/complete` | 201 | Marks onboarding as completed |

## Behaviour

- **`getStatus`** delegates to `OnboardingService.getOnboardingStatus(user.publicId)`.
- **`changePassword`** calls `UserService.changePassword`; a `false` result is translated into a `BadRequestException`. Returns the refreshed onboarding status.
- **`updateProfile`** calls `ProfileService.update` with the optional avatar. A falsy result is translated into an `InternalServerErrorException` as a safety net.
- **`createUnit`** delegates to `UnitService.create(user.neighborhoodId, dto, user.id)` and returns the refreshed onboarding status.
- **`complete`** calls `OnboardingService.completeOnboarding(user.id)` and returns `{ success: true }`.

## Notes

- Added `@ApiTags('Onboarding')` and `@ApiOperation` metadata for Swagger.
- `changePassword` previously declared `@HttpCode(HttpStatus.OK)` while documenting a `204` response; the JSDoc/`@ApiResponse` now correctly document `200`.
