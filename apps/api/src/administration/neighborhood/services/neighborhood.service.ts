import { Neighborhood, User } from '@core/database';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { DataSource } from 'typeorm';
import { CreateNeighborhoodDto } from '../dtos';
import { NeighStreetService } from './neigh-street.service';
import { NeighborhoodSearchService } from './neighborhood-search.service';

@Injectable()
export class NeighborhoodService {
  private readonly logger = new Logger(NeighborhoodService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly streetService: NeighStreetService,
    private readonly searchService: NeighborhoodSearchService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

      await this.streetService.createMany(
        sanitizedStreetsPayload,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      //clear findAllCache
      await this.clearNeighborhoodsCache();

      return this.searchService.findByPublicId(savedNeighborhood.publicId);
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

  private async clearNeighborhoodsCache(): Promise<void> {
    try {
      const store = (this.cacheManager as any).store;

      // TODO: use key patern on prod
      if (store && typeof store.keys === 'function') {
        const keys = await store.keys('cache:/api/neighborhood*');
        for (const key of keys) {
          await this.cacheManager.del(key);
        }
      } else {
        // Fallback para in-memory cache básico
        await this.cacheManager.clear();
      }
      this.logger.log('🧹 Neighborhoods cache successfully evicted.');
    } catch (error) {
      this.logger.error(`Failed to evict cache: ${error.message}`);
    }
  }
}
