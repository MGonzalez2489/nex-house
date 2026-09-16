import { BaseCatalog, BaseEntity } from '@core/database/entities/_base';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';

@Injectable()
export class CatalogsService {
  constructor(private readonly entityManager: EntityManager) {}

  /**
   * Retrieves all records from a specific catalog entity.
   * @param entity The target catalog entity class.
   * @param findOptions Optional TypeORM find options (where, order, relations...).
   * @returns A promise that resolves to an array of entity instances.
   */
  async findAll<T extends BaseEntity>(
    entity: EntityTarget<T>,
    findOptions?: FindManyOptions<T>,
  ): Promise<T[]> {
    return this.entityManager.find(entity, findOptions);
  }

  /**
   * Finds a single catalog record by its internal numeric ID.
   * @param entity The target catalog entity class.
   * @param id The internal primary key ID.
   * @returns A promise that resolves to the entity instance or throws a NotFoundException.
   */
  async findById<T extends BaseEntity>(
    entity: EntityTarget<T>,
    id: number,
  ): Promise<T> {
    return this.findOneOrFail(
      entity,
      { id } as FindOptionsWhere<T>,
      `with ID ${id} not found`,
    );
  }

  /**
   * Finds a single catalog record by its public UUID string.
   * @param entity The target catalog entity class.
   * @param publicId The unique public UUID.
   * @returns A promise that resolves to the entity instance or throws a NotFoundException.
   */
  async findByPublicId<T extends BaseEntity>(
    entity: EntityTarget<T>,
    publicId: string,
  ): Promise<T> {
    return this.findOneOrFail(
      entity,
      { publicId } as FindOptionsWhere<T>,
      `with Public ID ${publicId} not found`,
    );
  }

  /**
   * Finds a single catalog record by its internal systematic name.
   * @param entity The target catalog entity class.
   * @param name The system name string (usually mapped from an enum).
   * @returns A promise that resolves to the entity instance or throws a NotFoundException.
   */
  async findByName<T extends BaseCatalog>(
    entity: EntityTarget<T>,
    name: string,
  ): Promise<T> {
    return this.findOneOrFail(
      entity,
      { name } as FindOptionsWhere<T>,
      `with Name '${name}' not found`,
    );
  }

  /**
   * Resolves a single record or throws a normalized NotFoundException.
   * @param entity The target catalog entity class.
   * @param where The TypeORM where clause.
   * @param detail Message fragment appended to the entity name.
   */
  private async findOneOrFail<T extends BaseEntity>(
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    detail: string,
  ): Promise<T> {
    const record = await this.entityManager.findOneBy(entity, where);

    if (!record) {
      throw new NotFoundException(`${this.resolveEntityName(entity)} ${detail}`);
    }

    return record;
  }

  /**
   * Resolves a human-readable entity name. Falls back to `Catalog` when the
   * target is not a class (e.g. a string table alias or an EntitySchema).
   * @param entity The target catalog entity class.
   */
  private resolveEntityName(entity: EntityTarget<BaseEntity>): string {
    return typeof entity === 'function' ? entity.name : 'Catalog';
  }
}
