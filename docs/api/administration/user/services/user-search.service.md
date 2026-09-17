# UserSearchService

`apps/api/src/administration/user/services/user-search.service.ts`

Read-only, reusable user lookup helper consumed by `AuthService`, `PwdRecoveryService`, `ProfileService` and others.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<User>` | TypeORM user repository |

Default relations: `{ neighborhood: true }`, overridable per call.

## Public Methods

| Method | Description |
|---|---|
| `findOne(predicate, relations?): Promise<User \| null>` | Generic lookup by `FindOptionsWhere`; delegates to `findOneByCriteria` without a neighborhood scope |
| `findByPublicId(publicId, neighborhoodId?, relations?): Promise<User \| null>` | Lookup by public id, optionally scoped to a neighborhood |
| `findByPublicIdOrThrow(publicId, neighborhoodId?, relations?): Promise<User>` | Same as above but throws `NotFoundException` when missing |
| `findByEmail(email, neighborhoodId?, relations?): Promise<User \| null>` | Lookup by email, optionally scoped |
| `findByEmailOrThrow(email, neighborhoodId?, relations?): Promise<User>` | Same as above but throws `NotFoundException` when missing |

## Private Helpers

### `findOneByCriteria(criteria, neighborhoodId?, relations?): Promise<User | null>`

Centralizes the query, injecting `neighborhood: { id }` into the `where` clause when a `neighborhoodId` is provided and applying `relations ?? defaultRelations`.

## Notes

- Removed the unused `Logger` instance that was never written to.
