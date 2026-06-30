import { Neighborhood, NeighStreet, User } from '@core/database';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNeighborhoodDto } from '../dtos';
import { NeighStreetService } from './neigh-street.service';

@Injectable()
export class NeighborhoodService {
  private readonly logger = new Logger(NeighborhoodService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly streetService: NeighStreetService,
  ) {}

  /**
   * Orchestrates the multi-entity atomic creation of a neighborhood and its associated street catalog.
   * Enforces strict transactional safety, rolling back changes if cascading entity relations fail insertion.
   *
   * @param dto Data payload capturing structural names and street definitions arrays.
   * @param user The active operational user session triggering the registration context.
   * @throws BadRequestException if input constraints evaluation drops below expected thresholds.
   * @throws ConflictException if name tracking violates baseline registration uniqueness keys.
   * @returns A promise resolving to the final consolidated Neighborhood entity map tree.
   */
  async create(dto: CreateNeighborhoodDto, user: User): Promise<Neighborhood> {
    if (!dto.streets || dto.streets.length === 0) {
      throw new BadRequestException(
        'At least one street validation string is required.',
      );
    }

    const sanitizedName = dto.name.trim();
    const lookupName = sanitizedName.toLocaleLowerCase();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exists = await queryRunner.manager.findOne(Neighborhood, {
        where: { name: lookupName },
      });

      if (exists) {
        throw new ConflictException(
          `Neighborhood name "${sanitizedName}" already resides in database registries.`,
        );
      }

      const neighborhoodInstance = queryRunner.manager.create(Neighborhood, {
        name: lookupName,
        createdBy: user.id,
      });
      const savedNeighborhood = await queryRunner.manager.save(
        Neighborhood,
        neighborhoodInstance,
      );

      const sanitizedStreetsPayload = dto.streets.map((street) => ({
        name: street.trim().toLocaleLowerCase(),
        neighborhoodId: savedNeighborhood.id,
      }));

      const savedStreets = await this.streetService.createMany(
        sanitizedStreetsPayload,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return { ...savedNeighborhood, streets: savedStreets };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `🔴 Transaction failed during neighborhood instantiation pipeline: ${error.message}`,
      );

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Atomic operation failed during creation sequences.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
