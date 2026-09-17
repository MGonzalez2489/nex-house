import { Neighborhood } from '@core/database';
import { PaginatedResult, paginateQuery } from '@core/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { SearchNeighDto } from '../dtos';

interface FindAllOptions {
  /**
   * When `true`, the raw entity rows are returned instead of the paginated
   * wrapper. Used internally by consumers that need the bare dataset.
   */
  raw?: boolean;
}

@Injectable()
export class NeighborhoodSearchService {
  private readonly defaultRelations: FindOptionsRelations<Neighborhood> = {
    streets: true,
  };

  constructor(
    @InjectRepository(Neighborhood)
    private readonly repository: Repository<Neighborhood>,
  ) {}

  /**
   * Retrieves a paginated listing of neighborhoods plus header metadata.
   * Standard access path for consumer controllers.
   */
  async findAll(
    filters: SearchNeighDto,
    options?: { raw?: false },
  ): Promise<PaginatedResult<Neighborhood>>;

  /**
   * Retrieves raw neighborhood rows, skipping the pagination wrapper.
   * Used internally when `options.raw` is explicitly true.
   */
  async findAll(
    filters: SearchNeighDto,
    options: { raw: true },
  ): Promise<Neighborhood[]>;

  /**
   * Core query handling conditional global name tokens, activation filters and
   * output shaping.
   */
  async findAll(
    filters: SearchNeighDto,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Neighborhood> | Neighborhood[]> {
    const { globalFilter, isActive } = filters;

    const query = this.repository
      .createQueryBuilder('neighborhood')
      .leftJoinAndSelect('neighborhood.streets', 'streets')
      .leftJoinAndSelect('neighborhood.address', 'address')
      .leftJoinAndSelect('address.city', 'city')
      .leftJoinAndSelect('city.state', 'state');

    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('neighborhood.name LIKE :filter', {
            filter: `%${globalFilter}%`,
          });
        }),
      );
    }

    if (isActive !== undefined && isActive !== null) {
      query.andWhere('neighborhood.isActive = :isActive', { isActive });
    }

    const result = await paginateQuery(query, filters);

    return options?.raw === true ? result.data : result;
  }

  /**
   * Finds a neighborhood by its public UUID.
   *
   * @param publicId Public identifier token.
   * @param relations Relation map override (defaults to `streets`).
   */
  async findByPublicId(
    publicId: string,
    relations?: FindOptionsRelations<Neighborhood>,
  ): Promise<Neighborhood | null> {
    return this.findOneByCriteria({ publicId }, relations);
  }

  /**
   * Finds a neighborhood by its registered name.
   *
   * @param name Neighborhood display name.
   * @param relations Relation map override (defaults to `streets`).
   */
  async findByName(
    name: string,
    relations?: FindOptionsRelations<Neighborhood>,
  ): Promise<Neighborhood | null> {
    return this.findOneByCriteria({ name }, relations);
  }

  /**
   * Finds a neighborhood by its internal numerical identifier.
   *
   * @param id Primary key.
   * @param relations Relation map override (defaults to `streets`).
   */
  async findById(
    id: number,
    relations?: FindOptionsRelations<Neighborhood>,
  ): Promise<Neighborhood | null> {
    return this.findOneByCriteria({ id }, relations);
  }

  /**
   * Single-row lookup backed by the provided where criteria and relation map.
   */
  private async findOneByCriteria(
    criteria: FindOptionsWhere<Neighborhood>,
    relations?: FindOptionsRelations<Neighborhood>,
  ): Promise<Neighborhood | null> {
    return this.repository.findOne({
      where: { ...criteria },
      relations: relations ?? this.defaultRelations,
    });
  }
}