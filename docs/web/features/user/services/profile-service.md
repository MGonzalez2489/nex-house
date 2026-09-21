# ProfileService (web)

Thin HTTP client for the authenticated user's public profile.

- **File:** `apps/web/src/app/features/user/services/profile-service.ts`
- **Relies on:** `RequestService`.

## Methods

### `get(): Observable<ApiResponse<UserProfileModel>>`

`GET /api/user/profile` — returns `firstName`, `lastName`, `phone` and the
`avatar` file relation.

### `update(dto: FormData): Observable<ApiResponse<UserProfileModel>>`

`PATCH /api/user/profile` — sends a multipart `FormData` payload; only the
changed fields (including the optional `avatar` file) are appended by the shared
`ProfileFormComponent`.

## Notes

- Consumed by `UserStore.loadProfile()` / `UserStore.update()`, and also reused
  directly by the onboarding general component.

## Test coverage

- `apps/web/src/app/features/user/services/profile-service.spec.ts`
- Delegation to `GET`/`PATCH /api/user/profile` with a mocked `RequestService`.