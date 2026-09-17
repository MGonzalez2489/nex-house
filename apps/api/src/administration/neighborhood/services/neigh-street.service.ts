import { NeighStreet } from '@core/database';
import { SearchDto } from '@core/dtos';
import { PaginatedResult, paginateQuery } from '@core/utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class NeighStreetService {
  constructor(
    @InjectRepository(NeighStreet)
    private readonly streetRepo: Repository<NeighStreet>,
  ) {}

  /**
   * Creates multiple street records for a neighborhood. When an explicit
   * transactional manager is supplied, the insert runs inside that transaction.
   *
   * @param streets Raw street payloads (name + parent neighborhood ID).
   * @param createdBy Actor ID stamping the new records.
   * @param transactionalManager Optional manager to join an external transaction.
   */
  async createMany(
    streets: { name: string; neighborhoodId: number }[],
    createdBy: number,
    transactionalManager?: EntityManager,
  ): Promise<NeighStreet[]> {
    const manager = transactionalManager ?? this.streetRepo.manager;

    const entities = manager.create(
      NeighStreet,
      streets.map((street) => ({
        ...street,
        name: this.normalizeName(street.name),
        createdBy,
      })),
    );

    return await manager.save(NeighStreet, entities);
  }

  /**
   * Updates the name of a single street identified by its public UUID.
   *
   * @throws NotFoundException if no street matches the public ID.
   */
  async update(
    publicId: string,
    name: string,
    updatedBy: number,
  ): Promise<NeighStreet> {
    const street = await this.findByPublicId(publicId);

    if (!street) {
      throw new NotFoundException(
        `Street entry with identity "${publicId}" does not exist.`,
      );
    }

    street.name = this.normalizeName(name);
    street.updatedBy = updatedBy;
    return await this.streetRepo.save(street);
  }

  /**
   * Updates the names of multiple streets in one pass, reusing partial
   * entities (id + new values) so TypeORM resolves the correct rows.
   *
   * @param streets Collection of street IDs and fresh names.
   * @param transactionalManager Optional manager to join an external transaction.
   */
  async updateMany(
    streets: { id: number; name: string }[],
    updatedBy: number,
    transactionalManager?: EntityManager,
  ): Promise<NeighStreet[]> {
    const manager = transactionalManager ?? this.streetRepo.manager;

    const entities = manager.create(
      NeighStreet,
      streets.map((street) => ({
        id: street.id,
        name: this.normalizeName(street.name),
        updatedBy,
      })),
    );

    return await manager.save(NeighStreet, entities);
  }

  /**
   * Removes (soft delete) a single street by its public UUID.
   *
   * @throws NotFoundException if no street matches the public ID.
   */
  async remove(publicId: string, deletedBy: number): Promise<void> {
    const street = await this.findByPublicId(publicId);

    if (!street) {
      throw new NotFoundException(
        `Street entry with identity "${publicId}" does not exist.`,
      );
    }

    street.deletedBy = deletedBy;
    await this.streetRepo.save(street);
    await this.streetRepo.softRemove(street);
  }

  /**
   * Removes (soft delete) multiple streets by their primary keys.
   *
   * @param ids Street primary keys to remove.
   * @param transactionalManager Optional manager to join an external transaction.
   */
  async removeMany(
    ids: number[],
    deletedBy: number,
    transactionalManager?: EntityManager,
  ): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const manager = transactionalManager ?? this.streetRepo.manager;
    const streets = await manager.find(NeighStreet, {
      where: { id: In(ids) },
    });

    streets.forEach((street) => {
      street.deletedBy = deletedBy;
    });

    await manager.save(streets);
    await manager.softRemove(NeighStreet, streets);
  }

  /**
   * Finds a street by its internal numerical identifier.
   */
  async findById(id: number): Promise<NeighStreet | null> {
    return await this.streetRepo.findOneBy({ id });
  }

  /**
   * Finds a street by its public UUID.
   */
  async findByPublicId(publicId: string): Promise<NeighStreet | null> {
    return await this.streetRepo.findOneBy({ publicId });
  }

  /**
   * Paginates the streets of a neighborhood, filtering each whitespace-separated
   * term of `globalFilter` against the street name.
   */
  async findAll(
    neighborhoodId: number,
    filters: SearchDto,
  ): Promise<PaginatedResult<NeighStreet>> {
    const query = this.streetRepo
      .createQueryBuilder('street')
      .where('street.neighborhoodId = :neighborhoodId', {
        neighborhoodId,
      });

    const { globalFilter } = filters;

    if (globalFilter) {
      const terms = globalFilter
        .split(' ')
        .filter((term) => term.length > 0);

      if (terms.length > 0) {
        query.andWhere(
          new Brackets((andQb) => {
            terms.forEach((term, index) => {
              const paramName = `globalFilterTerm${index}`;
              andQb.andWhere(`street.name LIKE :${paramName}`, {
                [paramName]: `%${term}%`,
              });
            });
          }),
        );
      }
    }

    return await paginateQuery(query, filters);
  }

  /**
   * Normalizes free-form names to a consistent searchable casing.
   */
  private normalizeName(name: string): string {
    return name.trim().toLocaleLowerCase();
  }
}