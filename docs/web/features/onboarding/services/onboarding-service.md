# OnboardingService (web)

Thin HTTP client for the onboarding endpoints.

- **File:** `apps/web/src/app/features/onboarding/services/onboarding-service.ts`
- **Relies on:** `RequestService`.

## Methods

- `get()` — `GET /api/onboarding/status` → `OnboardingStatusResponseModel`.
- `changePassword(dto: ChangePassword)` — `PATCH /api/onboarding/security`.
- `updateProfile(dto: ProfileEditPayload)` — `PATCH /api/onboarding/profile`;
  converts the typed diff payload into multipart `FormData` via
  `toProfileFormData` (`@core/models/profile-edit-payload`). The avatar, when
  present, is sent as the `avatar` file field.
- `createUnit(dto: CreateUnit)` — `POST /api/onboarding/unit`.
- `complete()` — `POST /api/onboarding/complete`.

## Notes

- All methods return `Observable<ApiResponse<OnboardingStatusResponseModel>>`.
- Consumed by `OnboardingStore`.

## Test coverage

- `apps/web/src/app/features/onboarding/services/onboarding-service.spec.ts`
- Current spec is a basic creation test; the endpoints and the
  `toProfileFormData` conversion are exercised through the onboarding store and
  wizard page specs.