# UserController

`apps/api/src/administration/user/controllers/user.controller.ts`

Exposes the authenticated user's own account operations under `user`.

## Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/user` | Returns the authenticated user with `status`, `role`, `neighborhood` and `userUnits` relations (`unit` includes `street` and `type`; plus `userUnitRole`) |
| `GET` | `/user/stats` | Returns neighborhood-scoped user metrics (`UserStats`) |
| `PATCH` | `/user` | Updates the authenticated user (role and/or unit assignment) |

## `get(user): Promise<User>`

Delegates to `UserSearchService.findByPublicIdOrThrow` using the session's `publicId`, with explicit relations. Throws `NotFoundException` when the user is missing.

## `findStats(neigh): Promise<UserStats>`

Delegates to `UserStatsService.getStats(neigh.id)`.

## `update(dto, user, neigh): Promise<User>`

Delegates to `UserService.update(neigh.id, user.publicId, dto, user)`, always operating on the authenticated user within the active neighborhood.

## Notes

- The `neighborhood` relation is loaded with a TypeORM LEFT JOIN, so users without a neighborhood (e.g. the seeded super admin) still resolve with `neighborhood: null` instead of failing; the same relation is already loaded by `JwtStrategy.validate`.
- The previous `@ApiParam({ name: 'publicId' })` decorator was misleading because the route has no such parameter; it was removed.
- Response entities are serialized with the global `ClassSerializerInterceptor`, so `User.password` and other `@Exclude()` fields are not exposed.
