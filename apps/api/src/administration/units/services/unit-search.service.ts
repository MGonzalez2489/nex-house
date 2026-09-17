import { Unit } from '@core/database';
import { SearchDto } from '@core/dtos';
import { PaginatedResult, paginateQuery } from '@core/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitStats } from '@nexhouse/shared-domain/interfaces';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class UnitSearchService {
  constructor(
    @InjectRepository(Unit)
    private readonly repository: Repository<Unit>,
  ) {}

  /**
   * Returns a paginated list of units for a neighborhood, filtering the
   * identifier and street name by `globalFilter` when provided.
   */
  async findAll(
    filters: SearchDto,
    neighborhoodId: number,
  ): Promise<PaginatedResult<Unit>> {
    const { globalFilter } = filters;

    const query = this.repository
      .createQueryBuilder('units')
      .leftJoinAndSelect('units.street', 'street')
      .leftJoinAndSelect('units.type', 'type')
      .leftJoinAndSelect('units.userUnits', 'userUnits')
      .where('units.neighborhoodId = :neighborhoodId', {
        neighborhoodId,
      });

    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('units.identifier LIKE :filter', {
            filter: `%${globalFilter}%`,
          }).orWhere('street.name LIKE :filter', {
            filter: `%${globalFilter}%`,
          });
        }),
      );
    }

    return paginateQuery(query, filters);
  }

  /**
   * Aggregates unit counts for a neighborhood grouped by status, type and
   * street. Uses `displayName` as the grouping label for status and type, and
   * the street `name` for streets.
   */
  async findStats(neighborhoodId: number): Promise<UnitStats> {
    const rawStatusStats = await this.repository
      .createQueryBuilder('unit')
      .innerJoin('unit.status', 'status')
      .where('unit.neighborhoodId = :neighborhoodId', { neighborhoodId })
      .select('status.displayName', 'name')
      .addSelect('COUNT(unit.id)', 'count')
      .groupBy('status.displayName')
      .getRawMany<{ name: string; count: string }>();

    const rawTypeStats = await this.repository
      .createQueryBuilder('unit')
      .innerJoin('unit.type', 'type')
      .where('unit.neighborhoodId = :neighborhoodId', { neighborhoodId })
      .select('type.displayName', 'name')
      .addSelect('COUNT(unit.id)', 'count')
      .groupBy('type.displayName')
      .getRawMany<{ name: string; count: string }>();

    const rawStreetStats = await this.repository
      .createQueryBuilder('unit')
      .innerJoin('unit.street', 'street')
      .where('unit.neighborhoodId = :neighborhoodId', { neighborhoodId })
      .select('street.name', 'name')
      .addSelect('COUNT(unit.id)', 'count')
      .groupBy('street.name')
      .getRawMany<{ name: string; count: string }>();

    const byStatus = this.toCountMap(rawStatusStats);
    const totalUnits = rawStatusStats.reduce(
      (total, row) => total + parseInt(row.count, 10),
      0,
    );

    return {
      summary: { totalUnits },
      byStatus,
      byType: this.toCountMap(rawTypeStats),
      byStreet: this.toCountMap(rawStreetStats),
    };
  }

  /**
   * Maps raw `{ name, count }` rows into a `{ name: count }` dictionary.
   */
  private toCountMap(
    rows: { name: string; count: string }[],
  ): Record<string, number> {
    const map: Record<string, number> = {};

    for (const row of rows) {
      map[row.name] = parseInt(row.count, 10);
    }

    return map;
  }
}
