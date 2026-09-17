# ResidentSearchService

`apps/api/src/administration/residents/services/resident-search.service.ts`

Read-only service for resident lookups and paginated search. No transactional logic — all methods query the database directly via `Repository<User>`.

## Dependencies

| Token | Purpose |
|---|---|
| `Repository<User>` | Querying and count operations |

## Methods

### `findAll(neighId, dto) → Promise<PaginatedResult<User>>` (overloaded)

Returns a paginated, filtered, sorted list of users for a neighborhood. Two signatures:

- **Raw** `findAll(neighId, dto, null)` — returns `User[]` (used internally by other services).
- **Paginated** `findAll(neighId, dto)` — returns `PaginatedResult<User>` with `data`, `total`, `page`, `limit`.

#### Filters applied from `SearchUserDto`

| Field | Filter |
|---|---|
| `status` | `status.name = :status` (joins `user_status` via `statusId` FK) |
| `role` | `role.name = :role` (joins `user_role` via `roleId` FK) |
| `globalFilter` | `OR` on `user.email LIKE :q`, `profile.firstName LIKE :q`, `profile.lastName LIKE :q`, `role.name LIKE :q` |

The query always scopes to the given `neighborhoodId` and orders by `user.createdAt ASC`. Status and role joins use `addSelect` to minimize payload (id, name, publicId).

### `findByPublicId(publicId, neighborhoodId, relations?) → Promise<User | null>`

Looks up a single user by `publicId`, scoped to the neighborhood. Optional `relations` object controls eager relation loading (e.g. `{ status: true, role: true }`). Returns `null` if not found.

### `findByPublicIdOrThrow(publicId, neighborhoodId, relations?) → Promise<User>`

Same as `findByPublicId` but throws `NotFoundException` if the user does not exist.

### `findByEmail(email, neighborhoodId, relations?) → Promise<User | null>`

Looks up by `email` (case-insensitive) and neighborhood scope. Default relations: `{ status: true, role: true }`.

### `findByEmailOrThrow(email, neighborhoodId, relations?) → Promise<User>`

Same as `findByEmail` but throws `NotFoundException` if not found.

## Key Bug Fixes (this revision)

- **Removed dead `logger`** field (was instantiated but never used).
- **Fixed invalid SQL in status/role filters**: the original code used unqualified `role = :role` and `status = :status` which referenced non-existent columns on the `users` table. Corrected to `role.name = :role` and `status.name = :status` (the User entity has `roleId`/`statusId` FK columns, not `role`/`status` columns).
- **`globalFilter` OR grouping**: parentheses added around the four `OR` conditions to prevent precedence issues with other `andWhere` clauses (status/role filters).
