# Skill: Create TypeORM Entity

This skill defines the mandatory step-by-step workflow for creating or modifying a TypeORM database entity within the NexHouse NestJS backend (`apps/api`).

---

## File Location & Base Classes

- **Location:** Entities MUST be located in `apps/api/src/_core/database/entities/`.
- **Base Directory:** `apps/api/src/_core/database/entities/_base/` contains the base abstract classes:
  - `BaseEntity` (Primary key `id: number`, `publicId: string` UUID)
  - `BaseTraceableEntity` (Extends `BaseEntity` + `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`)
  - `BaseCatalog` (Extends `BaseEntity` + `name: string`, `displayName: string`)

---

## Step-by-Step Decision Checklist

### 1. Choose the Correct Base Class

When creating a new entity, **you MUST inherit from one of these two classes**:

- **Use `BaseCatalog`** if the entity represents a master catalog (e.g., Statuses, Roles, Types) where change tracking / soft-delete is NOT required.
- **Use `BaseTraceableEntity`** for operational/business entities that require audit trail, creation/update tracking, and soft deletes.

### 2. Table Naming & Annotations

- Decorate class with `@Entity('plural_snake_case')` (e.g., `@Entity('cities')` or `@Entity('neighborhood_addresses')`).
- Class name MUST be PascalCase in singular (e.g., `NeighborhoodAddress`).

### 3. Relation Columns Standard

- Foreign Key ID columns MUST follow the pattern `<entityName>Id` (e.g., `cityId`, `neighborhoodId`, `profileId`).
- Foreign Key ID columns MUST use `@Exclude()` from `class-transformer`.
- Foreign Key ID properties MUST be of type `number`.
- Foreign Key DB column names MUST match the camelCase property name in `@JoinColumn({ name: 'foreignKeyId' })`.

---

## Standard Code Examples

### Option A: Functional Entity (Inheriting from `BaseTraceableEntity`)

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseTraceableEntity } from '../_base/base-traceable.entity';
import { Neighborhood } from './neighborhood.entity';

@Entity('neighborhood_addresses')
export class NeighborhoodAddress extends BaseTraceableEntity {
  @Column({
    name: 'street_address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  streetAddress: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 10, nullable: true })
  zipCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  @Exclude()
  neighborhoodId: number;

  @ManyToOne(() => Neighborhood)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}
```

### Option B: Catalog Entity (Inheriting from `BaseCatalog`)

```typescript
import { Entity, Column } from 'typeorm';
import { BaseCatalog } from '../_base/base-catalog.entity';

@Entity('property_types')
export class PropertyType extends BaseCatalog {
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;
}
```
