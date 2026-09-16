# CatalogsService

Generic catalog data-access service. It performs lookups against catalog-style
entities (systematic codes mapped from enums) and the location hierarchy using a
TypeORM `EntityManager`.

- **File:** `apps/api/src/catalogs/services/catalogs.service.ts`
- **Scope:** `catalogs` module — exported and consumed across `administration` (user, resident, unit, neighborhood).
- **Injectable:** Yes (`@Injectable`), Nest singleton (default).
- **Exposed via:** `CatalogsModule` exports (`catalogs.module.ts`); barrel `apps/api/src/catalogs/services/index.ts` and alias `@catalogs/services`.

## Dependencies

| Dependency | Usage |
|---|---|
| `EntityManager` (TypeORM) | `find` / `findOneBy` against arbitrary entity targets |

## Public contract

All methods take an `EntityTarget` first and delegate resolution to the injected
`EntityManager`, returning a `Promise` of the entity/entities.

### `findAll<T extends BaseEntity>(entity, findOptions?): Promise<T[]>`

- Runs `entityManager.find(entity, findOptions)`.
- `findOptions` is optional (`FindManyOptions<T>`); forwarded untouched (where,
  order, relations...).

### `findById<T extends BaseEntity>(entity, id): Promise<T>`

- Runs `findOneBy(entity, { id })`.
- No record → `NotFoundException('<Name> with ID <id> not found')`.

### `findByPublicId<T extends BaseEntity>(entity, publicId): Promise<T>`

- Runs `findOneBy(entity, { publicId })` (UUID lookup — the route-facing key used
  by `states/:countryId` and `cities/:stateId`).
- No record → `NotFoundException('<Name> with Public ID <publicId> not found')`.

### `findByName<T extends BaseCatalog>(entity, name): Promise<T>`

- Runs `findOneBy(entity, { name })` (systematic enum code, e.g. `ACTIVE`).
- No record → `NotFoundException("<Name> with Name '<name>' not found")`.

## Internal helpers

### `findOneOrFail<T extends BaseEntity>(entity, where, detail): Promise<T>`

- Single code path shared by `findById` / `findByPublicId` / `findByName`:
  `findOneBy` → null check → `NotFoundException`.
- `detail` is the message fragment suffix (`'with ID 99 not found'`), prefixed
  with the resolved entity name.

### `resolveEntityName(entity): string`

- `typeof entity === 'function'` → `entity.name` (the class name, e.g.
  `UserStatus`).
- Otherwise (string table alias / `EntitySchema`) → literal fallback `'Catalog'`.

## Typing notes

- `findAll`, `findById`, `findByPublicId` are constrained to `T extends
  BaseEntity` — they only need `id`/`publicId`, so they also serve the location
  entities (`Country`, `State`, `City`, which extend `BaseEntity` rather than
  `BaseCatalog`).
- `findByName` stays `T extends BaseCatalog` because it requires the `name`
  column.
- Error message text is preserved from the previous implementation to avoid
  breaking callers or tests asserting on message strings.

## Test coverage

- `apps/api/src/catalogs/services/catalogs.service.spec.ts` (11 cases)
- Covers: `findAll` (records + forwarding `findOptions`), `findById` /
  `findByPublicId` / `findByName` (matched record + `NotFoundException`), and the
  non-class entity target fallback (`'Catalog'`).