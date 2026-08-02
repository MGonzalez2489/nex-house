import { Unit } from '@core/database';
import { SearchDto } from '@core/dtos';
import { paginateQuery } from '@core/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitStats } from '@nexhouse/shared-domain/interfaces';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class UnitSearchService {
  private readonly logger = new Logger(UnitSearchService.name);

  constructor(
    @InjectRepository(Unit)
    private readonly repository: Repository<Unit>,
  ) {}

  async findAll(filters: SearchDto, neighborhoodId: number) {
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
          }).orWhere(`street.name LIKE :filter`, {
            filter: `%${globalFilter}%`,
          });
        }),
      );
    }

    const result = await paginateQuery(query, filters);

    return result;
  }

  async findStats(neighborhoodId: number): Promise<UnitStats> {
    // 1. Conteo por Estado
    const rawStatusStats = await this.repository
      .createQueryBuilder('unit')
      .innerJoin('unit.status', 'status')
      .where('unit.neighborhoodId = :neighborhoodId', {
        neighborhoodId,
      })
      .select('status.displayName', 'name')
      .addSelect('COUNT(unit.id)', 'count')
      .groupBy('status.displayName')
      .getRawMany<{ name: string; count: string }>();

    // 2. Conteo por Tipo
    const rawTypeStats = await this.repository
      .createQueryBuilder('unit')
      .innerJoin('unit.type', 'type')
      .where('unit.neighborhoodId = :neighborhoodId', {
        neighborhoodId,
      })
      .select('type.displayName', 'name')
      .addSelect('COUNT(unit.id)', 'count')
      .groupBy('type.displayName')
      .getRawMany<{ name: string; count: string }>();

    // 3. Conteo por Calle
    const rawStreetStats = await this.repository
      .createQueryBuilder('unit')
      .innerJoin('unit.street', 'street')
      .where('unit.neighborhoodId = :neighborhoodId', {
        neighborhoodId,
      })
      .select('street.name', 'name')
      .addSelect('COUNT(unit.id)', 'count')
      .groupBy('street.name')
      .getRawMany<{ name: string; count: string }>();

    // Mapeo a diccionario y cálculo del total
    const byStatus: Record<string, number> = {};
    let totalUnits = 0;
    for (const row of rawStatusStats) {
      const count = parseInt(row.count, 10);
      byStatus[row.name] = count;
      totalUnits += count;
    }

    const byType: Record<string, number> = {};
    for (const row of rawTypeStats) {
      byType[row.name] = parseInt(row.count, 10);
    }

    const byStreet: Record<string, number> = {};
    for (const row of rawStreetStats) {
      byStreet[row.name] = parseInt(row.count, 10);
    }

    return {
      summary: { totalUnits },
      byStatus,
      byType,
      byStreet,
    };
  }
}
