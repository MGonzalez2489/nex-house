import { NeighStreet } from '@core/database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class NeighStreetService {
  private readonly logger = new Logger(NeighStreetService.name);

  constructor(
    @InjectRepository(NeighStreet)
    private readonly streetRepo: Repository<NeighStreet>,
  ) {}

  /**
   * Spawns multiple street entries attached to a shared neighborhood parent context.
   * Can hook seamlessly into external ACID transaction environments if an explicit manager is supplied.
   *
   * @param streets Formatted collection of raw name strings and parent target numerical IDs.
   * @param transactionalManager Optional TypeORM context coordinator to sustain atomic boundaries.
   * @returns An array containing the newly instantiated and persisted record maps.
   */
  async createMany(
    streets: { name: string; neighborhoodId: number }[],
    createdBy: number,
    transactionalManager?: EntityManager,
  ): Promise<NeighStreet[]> {
    const manager = transactionalManager ?? this.streetRepo.manager;

    const s = streets.map((f) => ({ ...f, createdBy }));

    const entities = manager.create(NeighStreet, s);
    return await manager.save(NeighStreet, entities);
  }

  /**
   * Mutates the descriptive properties of a specific street record.
   *
   * @param publicId Cross-boundary unique secure identifier token.
   * @param name Fresh descriptive string tracking the street title.
   * @throws NotFoundException if target identity does not map to a persistent record.
   * @returns The updated entity state snapshot.
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

    street.name = name.trim().toLocaleLowerCase();
    street.updatedBy = updatedBy;
    return await this.streetRepo.save(street);
  }

  /**
   * Mutates the descriptive properties of multiple street records.
   * Can hook seamlessly into external ACID transaction environments if an explicit manager is supplied.
   *
   * @param streets Formatted collection of street IDs and new names.
   * @param transactionalManager Optional TypeORM context coordinator to sustain atomic boundaries.
   * @returns An array containing the updated and persisted record maps.
   */
  async updateMany(
    streets: { id: number; name: string }[],
    updatedBy: number,
    transactionalManager?: EntityManager,
  ): Promise<NeighStreet[]> {
    const manager = transactionalManager ?? this.streetRepo.manager;

    // TypeORM's save method intelligently updates if entities have an ID.
    // We create partial entities with just the ID and the new name.
    const entitiesToUpdate = streets.map((street) =>
      manager.create(NeighStreet, {
        id: street.id,
        name: street.name,
        updatedBy,
      }),
    );

    return await manager.save(NeighStreet, entitiesToUpdate);
  }

  /**
   * Evicts a street record permanently from physical tables.
   *
   * @param publicId Cross-boundary unique secure identifier token.
   * @throws NotFoundException if target identity does not map to a persistent record.
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
   * Evicts multiple street records permanently from physical tables based on their IDs.
   * Can hook seamlessly into external ACID transaction environments if an explicit manager is supplied.
   *
   * @param ids An array of primary numerical identifiers of the streets to remove.
   * @param transactionalManager Optional TypeORM context coordinator to sustain atomic boundaries.
   */
  async removeMany(
    ids: number[],
    deletedBy: number,
    transactionalManager?: EntityManager,
  ): Promise<void> {
    if (ids.length === 0) {
      return; // No IDs to remove, return early.
    }
    const manager = transactionalManager ?? this.streetRepo.manager;
    const streets = await manager.find(NeighStreet, {
      where: { id: In(ids) },
    });

    for (const street of streets) {
      street.deletedBy = deletedBy;
    }

    await manager.save(streets);
    await manager.softRemove(NeighStreet, streets);
  }

  /**
   * Internal lookup locating street entities against primary automatic increment keys.
   *
   * @param id Inter-system relational numerical identifier.
   */
  async findById(id: number): Promise<NeighStreet | null> {
    return await this.streetRepo.findOneBy({ id });
  }

  /**
   * Evaluates system indices to find a specific street by its secure public UUID string.
   *
   * @param publicId Cross-boundary unique secure identifier token.
   */
  async findByPublicId(publicId: string): Promise<NeighStreet | null> {
    return await this.streetRepo.findOneBy({ publicId });
  }
}
