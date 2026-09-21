# UserService (web)

Thin HTTP client for the authenticated user's own account record.

- **File:** `apps/web/src/app/features/user/services/user-service.ts`
- **Relies on:** `RequestService`.

## Methods

### `get(): Observable<ApiResponse<UserModel>>`

`GET /api/user` — returns the authenticated user with its `status`, `role`,
`neighborhood` and `userUnits` relations.

## Notes

- The previous `update()` (PATCH) method had no callers and was removed.
- Consumed exclusively by `UserStore.loadUser()`.

## Test coverage

- `apps/web/src/app/features/user/services/user-service.spec.ts`
- Delegation to `GET /api/user` with a mocked `RequestService`.