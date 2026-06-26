import { BaseCatalog } from '@core/database/entities/_base';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, EntityTarget, FindOptionsWhere } from 'typeorm';

@Injectable()
export class CatalogsService {
  constructor(private readonly entityManager: EntityManager) {}

  /**
   * Retrieves all records from a specific catalog entity.
   * @param entity The target catalog entity class.
   * @returns A promise that resolves to an array of entity instances.
   */
  async findAll<T extends BaseCatalog>(entity: EntityTarget<T>): Promise<T[]> {
    return this.entityManager.find(entity);
  }

  /**
   * Finds a single catalog record by its internal numeric ID.
   * @param entity The target catalog entity class.
   * @param id The internal primary key ID.
   * @returns A promise that resolves to the entity instance or throws a NotFoundException.
   */
  async findById<T extends BaseCatalog>(
    entity: EntityTarget<T>,
    id: number,
  ): Promise<T> {
    const where = { id } as FindOptionsWhere<T>;
    const record = await this.entityManager.findOneBy(entity, where);

    if (!record) {
      const entityName = typeof entity === 'function' ? entity.name : 'Catalog';
      throw new NotFoundException(`${entityName} with ID ${id} not found`);
    }

    return record;
  }

  /**
   * Finds a single catalog record by its public UUID string.
   * @param entity The target catalog entity class.
   * @param publicId The unique public UUID.
   * @returns A promise that resolves to the entity instance or throws a NotFoundException.
   */
  async findByPublicId<T extends BaseCatalog>(
    entity: EntityTarget<T>,
    publicId: string,
  ): Promise<T> {
    const where = { publicId } as FindOptionsWhere<T>;
    const record = await this.entityManager.findOneBy(entity, where);

    if (!record) {
      const entityName = typeof entity === 'function' ? entity.name : 'Catalog';
      throw new NotFoundException(
        `${entityName} with Public ID ${publicId} not found`,
      );
    }

    return record;
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
    const where = { name } as FindOptionsWhere<T>;
    const record = await this.entityManager.findOneBy(entity, where);

    if (!record) {
      const entityName = typeof entity === 'function' ? entity.name : 'Catalog';
      throw new NotFoundException(
        `${entityName} with Name '${name}' not found`,
      );
    }

    return record;
  }
}
