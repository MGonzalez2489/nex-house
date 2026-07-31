import { Unit } from '@core/database';
import { SearchDto } from '@core/dtos';
import { paginateQuery } from '@core/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
