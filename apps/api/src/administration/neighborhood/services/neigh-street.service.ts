import { NeighStreet } from '@core/database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

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
    transactionalManager?: EntityManager,
  ): Promise<NeighStreet[]> {
    const manager = transactionalManager ?? this.streetRepo.manager;

    const entities = manager.create(NeighStreet, streets);
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
  async update(publicId: string, name: string): Promise<NeighStreet> {
    const street = await this.findByPublicId(publicId);

    if (!street) {
      throw new NotFoundException(
        `Street entry with identity "${publicId}" does not exist.`,
      );
    }

    street.name = name.trim().toLocaleLowerCase();
    return await this.streetRepo.save(street);
  }

  /**
   * Evicts a street record permanently from physical tables.
   *
   * @param publicId Cross-boundary unique secure identifier token.
   * @throws NotFoundException if target identity does not map to a persistent record.
   */
  async remove(publicId: string): Promise<void> {
    const street = await this.findByPublicId(publicId);

    if (!street) {
      throw new NotFoundException(
        `Street entry with identity "${publicId}" does not exist.`,
      );
    }

    await this.streetRepo.remove(street);
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
