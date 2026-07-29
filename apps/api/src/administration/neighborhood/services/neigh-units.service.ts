import { Unit } from '@core/database';
import { SearchDto } from '@core/dtos';
import { paginateQuery } from '@core/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class NeighUnitsService {
  private readonly logger = new Logger(NeighUnitsService.name);

  constructor(
    @InjectRepository(Unit)
    private readonly unitRepo: Repository<Unit>,
  ) {}

  async findAll(neighborhoodId: number, filters: SearchDto) {
    const query = this.unitRepo
      .createQueryBuilder('unit')
      .leftJoinAndSelect('unit.street', 'street')
      .leftJoinAndSelect('unit.type', 'type')
      .where('unit.neighborhoodId = :neighborhoodId', {
        neighborhoodId,
      });

    const { globalFilter } = filters;

    if (globalFilter) {
      const globalFilterWords = globalFilter
        .split(' ')
        .filter((word) => word.length > 0);

      if (globalFilterWords.length > 0) {
        query.andWhere(
          new Brackets((andQb) => {
            globalFilterWords.forEach((word, index) => {
              const paramName = `globalFilterWord${index}`;
              andQb.andWhere(
                new Brackets((orQb) => {
                  orQb
                    .where(`street.name LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    })
                    .orWhere(`unit.identifier LIKE :${paramName}`, {
                      [paramName]: `%${word}%`,
                    });
                }),
              );
            });
          }),
        );
      }
    }
    const result = await paginateQuery(query, filters);
    return result;
  }
}
