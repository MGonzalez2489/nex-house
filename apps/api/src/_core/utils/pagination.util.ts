import { SearchDto } from '@core/dtos';
import { ApiPaginationMeta } from '@nexhouse/shared-domain/interfaces';
import {
  ObjectLiteral,
  Repository,
  FindManyOptions,
  SelectQueryBuilder,
  FindOptionsOrder,
} from 'typeorm';

export interface PaginatedResult<T> {
  data: T[];
  meta: ApiPaginationMeta;
}

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  searchDto: SearchDto,
  findOptions: FindManyOptions<T> = {},
): Promise<PaginatedResult<T>> {
  const first = searchDto.first ?? 0;
  const rows = searchDto.rows ?? 10;

  const sortField = searchDto.sortField || 'createdAt';
  const sortOrder = searchDto.sortOrder === 1 ? 'ASC' : 'DESC';

  const [data, total] = await repository.findAndCount({
    ...findOptions,
    skip: first,
    take: rows,
    order: { [sortField]: sortOrder } as FindOptionsOrder<T>, // Solucionado el 'as any'
  });

  return {
    data,
    meta: {
      total,
      page: Math.floor(first / rows) + 1,
      lastPage: Math.ceil(total / rows) || 1,
      limit: rows,
    },
  };
}

export async function paginateQuery<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  searchDto: SearchDto,
): Promise<PaginatedResult<T>> {
  const first = searchDto.first ?? 0;
  const rows = searchDto.rows ?? 10;

  const sortField = searchDto.sortField || 'createdAt';
  const sortOrder = searchDto.sortOrder === 1 ? 'ASC' : 'DESC';

  const mainAlias = query.expressionMap.mainAlias;
  if (!mainAlias) {
    throw new Error('QueryBuilder must have a main alias execution context');
  }

  if (sortField) {
    const orderColumn = sortField.includes('.')
      ? sortField
      : `${query.alias}.${sortField}`;

    query.addOrderBy(orderColumn, sortOrder);
  }

  const [entities, count] = searchDto.showAll
    ? await query.getManyAndCount()
    : await query.skip(first).take(rows).getManyAndCount();

  return {
    data: entities,
    meta: {
      total: count,
      page: Math.floor(first / rows) + 1,
      lastPage: Math.ceil(count / rows) || 1,
      limit: rows,
    },
  };
}
