import { Neighborhood } from '@core/database';
import { SearchDto } from '@core/dtos';
import { PaginatedResult, paginateQuery } from '@core/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

@Injectable()
export class NeighborhoodSearchService {
  private readonly logger = new Logger(NeighborhoodSearchService.name);

  private readonly defaultRelations: FindOptionsRelations<Neighborhood> = {
    streets: true,
  };

  constructor(
    @InjectRepository(Neighborhood)
    private readonly repository: Repository<Neighborhood>,
  ) {}

  /**
   * Retrieves a listing of neighborhoods omitting raw metadata wrappers.
   * Activated internally when the options payload explicitly passes raw: true.
   */
  async findAll(
    filters: SearchDto,
    options: { raw: true },
  ): Promise<Neighborhood[]>;

  /**
   * Retrieves a structured paginated array of neighborhoods alongside interface header metadata.
   * Standard access path for consumer controllers.
   */
  async findAll(
    filters: SearchDto,
    options?: { raw?: false },
  ): Promise<PaginatedResult<Neighborhood>>;

  /**
   * Core matrix querying handling conditional global strings tokens, dynamic relations maps, and output formatting.
   */
  async findAll(
    search: SearchDto,
    options?: { raw?: boolean },
  ): Promise<PaginatedResult<Neighborhood> | Neighborhood[]> {
    const { globalFilter } = search;

    const query = this.repository
      .createQueryBuilder('neighborhood')
      .leftJoinAndSelect('neighborhood.streets', 'streets');

    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('neighborhood.name LIKE :filter', {
            filter: `%${globalFilter}%`,
          });
        }),
      );
    }

    const result = await paginateQuery(query, search);

    if (options?.raw === true) {
      return result.data;
    }

    return result;
  }

  /**
   * Resolves a unique neighborhood instance tracking against its secure cross-boundary public UUID.
   *
   * @param publicId Validated unique identifier token.
   * @param relations Override criteria mapping object.
   */
  async findByPublicId(
    publicId: string,
    relations?: FindOptionsRelations<Neighborhood>,
  ): Promise<Neighborhood | null> {
    return this.findOneByCriteria({ publicId }, relations);
  }

  /**
   * Validates name presence constraints across core tenant registrations.
   *
   * @param name Descriptive legal registration string.
   * @param relations Override criteria mapping object.
   */
  async findByName(
    name: string,
    relations?: FindOptionsRelations<Neighborhood>,
  ): Promise<Neighborhood | null> {
    return this.findOneByCriteria({ name }, relations);
  }

  /**
   * Dynamic isolation helper querying database rows via granular configuration schemas.
   */
  private async findOneByCriteria(
    criteria: FindOptionsWhere<Neighborhood>,
    relations?: FindOptionsRelations<Neighborhood>,
  ): Promise<Neighborhood | null> {
    const whereCondition: FindOptionsWhere<Neighborhood> = { ...criteria };

    return this.repository.findOne({
      where: whereCondition,
      relations: relations ?? this.defaultRelations,
    });
  }
}
