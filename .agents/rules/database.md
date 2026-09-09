# Database & TypeORM Rules

## Universal Conventions

1. **Table Names:** Plural `snake_case` (`countries`, `states`, `cities`, `neighborhood_addresses`, `neighborhoods`).
2. **Foreign Keys:** Singular `table_id` (`city_id`, `neighborhood_id`).
3. **Entity Properties:** `camelCase` in TS mapped with `@Column({ name: 'snake_case' })`.
4. **Primary Keys:** `@PrimaryGeneratedColumn('uuid')`.
5. **Audit Fields:** Every entity must include `createdAt` (`created_at`) and `updatedAt` (`updated_at`).

## Location Architecture (Zero-Redundancy Rule)

- **Hierarchy:** `Country` (1) ──< (N) `State` (1) ──< (N) `City` (1) ──< (N) `NeighborhoodAddress` (1) ── (1) `Neighborhood`.
- `NeighborhoodAddress` strictly references `city_id`. `State` and `Country` are retrieved transitively through relations (`city.state.country`).
- **Forbidden:** Never store `state_id` or `country_id` directly in `neighborhood_addresses`.

## GPS Coordinates Standard

Store latitude and longitude with precision 10 and scale 7:

```typescript
@Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
latitude: number;

@Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
longitude: number;
```
