import {
  ResidentSearchService,
  ResidentService,
} from '@administration/residents/services';
import {
  City,
  NeighAddress,
  Neighborhood,
  NeighStreet,
  User,
} from '@core/database';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CatalogsService } from 'src/catalogs/services';
import { DataSource } from 'typeorm';
import { CreateNeighborhoodDto, UpdateNeighborhoodDto } from '../dtos';
import { NeighStreetService } from './neigh-street.service';
import { NeighborhoodSearchService } from './neighborhood-search.service';

@Injectable()
export class NeighborhoodService {
  private readonly logger = new Logger(NeighborhoodService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly streetService: NeighStreetService,
    private readonly searchService: NeighborhoodSearchService,
    private readonly residentService: ResidentService,
    private readonly residentSearchService: ResidentSearchService,
    private readonly catService: CatalogsService,
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

    const existingAdmin = await this.residentSearchService.findByEmail(
      dto.adminEmail,
    );
    if (existingAdmin) {
      throw new ConflictException(`User ${dto.adminEmail} already exists.`);
    }
    //location
    const city = await this.catService.findByPublicId(City, dto.cityId);

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

      //neighborhood
      const neighborhoodInstance = queryRunner.manager.create(Neighborhood, {
        name: lookupName,
        isActive: dto.isActive,
        createdBy: user.id,
      });
      const savedNeighborhood = await queryRunner.manager.save(
        Neighborhood,
        neighborhoodInstance,
      );

      const neighAddress = queryRunner.manager.create(NeighAddress, {
        zipCode: dto.zipCode,
        cityId: city.id,
        neighborhood: savedNeighborhood,
        createdBy: user.id,
      });

      await queryRunner.manager.save(NeighAddress, neighAddress);

      //streets
      const sanitizedStreetsPayload = dto.streets.map((street) => ({
        name: street.name.trim().toLocaleLowerCase(),
        neighborhoodId: savedNeighborhood.id,
      }));

      await this.streetService.createMany(
        sanitizedStreetsPayload,
        user.id,
        queryRunner.manager,
      );

      //user service
      await this.residentService.createFirstAdmin(
        savedNeighborhood.id,
        dto.adminEmail,
        user,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      //clear findAllCache
      await this.clearNeighborhoodsCache();
      //TODO: send confirmation email to the first admin user

      return this.searchService.findByPublicId(savedNeighborhood.publicId, {
        streets: true,
        address: {
          city: true,
        },
      });
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

  /**
   * Orchestrates the multi-entity atomic update of a neighborhood and its associated street catalog.
   * Handles street creation, updates, and removals based on publicId and DTO content.
   * Enforces strict transactional safety, rolling back changes if cascading entity relations fail insertion.
   *
   * @param publicId The public ID of the neighborhood to update.
   * @param dto Data payload capturing structural names and street definitions arrays.
   * @param user The active operational user session triggering the registration context.
   * @throws NotFoundException if the neighborhood with the given public ID is not found.
   * @throws BadRequestException if input constraints evaluation drops below expected thresholds (e.g., invalid street publicId).
   * @throws ConflictException if name tracking violates baseline registration uniqueness keys.
   * @returns A promise resolving to the final consolidated Neighborhood entity map tree.
   */
  async update(
    publicId: string,
    dto: UpdateNeighborhoodDto,
    user: User,
  ): Promise<Neighborhood> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const neighborhoodToUpdate = await queryRunner.manager.findOne(
        Neighborhood,
        {
          where: { publicId },
        },
      );

      if (!neighborhoodToUpdate) {
        throw new NotFoundException(
          `Neighborhood with public ID "${publicId}" not found.`,
        );
      }

      // --- Neighborhood Name Uniqueness Check and Update ---
      if (dto.name !== undefined) {
        const sanitizedName = dto.name.trim();
        const lookupName = sanitizedName.toLocaleLowerCase();

        if (lookupName !== neighborhoodToUpdate.name) {
          const exists = await queryRunner.manager.findOne(Neighborhood, {
            where: { name: lookupName },
          });

          if (exists && exists.id !== neighborhoodToUpdate.id) {
            throw new ConflictException(
              `Neighborhood name "${sanitizedName}" already resides in database registries.`,
            );
          }
        }
        neighborhoodToUpdate.name = lookupName;
      }

      if (dto.isActive !== undefined) {
        neighborhoodToUpdate.isActive = dto.isActive;
      }
      neighborhoodToUpdate.updatedBy = user.id;
      // neighborhoodToUpdate.updatedAt = new Date(); // Uncomment if your entity has an updatedAt field

      const savedNeighborhood = await queryRunner.manager.save(
        Neighborhood,
        neighborhoodToUpdate,
      );

      // --- Street Management ---
      if (dto.streets !== undefined) {
        const existingStreets = await queryRunner.manager.find(NeighStreet, {
          where: { neighborhoodId: savedNeighborhood.id },
        });

        const streetsToCreate = [];
        const streetsToUpdate = [];
        const existingStreetPublicIdsInDto = new Set<string>(); // Tracks publicIds of existing streets that are present in the DTO

        for (const dtoStreet of dto.streets) {
          if (dtoStreet.publicId) {
            // This street from DTO has a publicId, so it's meant to update an existing one.
            const existing = existingStreets.find(
              (s) => s.publicId === dtoStreet.publicId,
            );

            if (existing) {
              existingStreetPublicIdsInDto.add(existing.publicId); // Mark this existing street as 'present in DTO'
              // Only add to update list if name has actually changed
              if (
                existing.name.toLocaleLowerCase() !==
                dtoStreet.name.trim().toLocaleLowerCase()
              ) {
                streetsToUpdate.push({
                  id: existing.id, // Use primary key for update
                  name: dtoStreet.name.trim().toLocaleLowerCase(),
                });
              }
            } else {
              // PublicId provided in DTO but no matching existing street for this neighborhood.
              // As per prompt, publicId implies an update, so if not found, it's an error.
              throw new BadRequestException(
                `Street with public ID "${dtoStreet.publicId}" not found for neighborhood ${publicId}.`,
              );
            }
          } else {
            // No publicId provided, this is a new street to be created.
            streetsToCreate.push({
              name: dtoStreet.name.trim().toLocaleLowerCase(),
              neighborhoodId: savedNeighborhood.id,
            });
          }
        }

        // Streets to remove are those existing streets whose publicId is NOT found in the DTO's publicIds
        const streetsToRemoveIds = existingStreets
          .filter(
            (existingStreet) =>
              !existingStreetPublicIdsInDto.has(existingStreet.publicId),
          )
          .map((s) => s.id); // Get their primary keys for removal

        // Perform street operations
        if (streetsToCreate.length > 0) {
          await this.streetService.createMany(
            streetsToCreate,
            user.id,
            queryRunner.manager,
          );
        }

        if (streetsToUpdate.length > 0) {
          await this.streetService.updateMany(
            streetsToUpdate, // Assuming streetService.updateMany takes an array of objects with 'id' and 'name'
            user.id,
            queryRunner.manager,
          );
        }

        //TODO: double check if exists units related to the street
        if (streetsToRemoveIds.length > 0) {
          await this.streetService.removeMany(
            streetsToRemoveIds, // Assuming streetService.removeMany takes an array of IDs
            user.id,
            queryRunner.manager,
          );
        }
      }

      await queryRunner.commitTransaction();
      await this.clearNeighborhoodsCache();

      return this.searchService.findByPublicId(savedNeighborhood.publicId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `🔴 Transaction failed during neighborhood update pipeline: ${error.message}`,
      );

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Atomic operation failed during update sequences.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async clearNeighborhoodsCache(): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
