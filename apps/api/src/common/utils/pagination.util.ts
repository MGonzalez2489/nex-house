import { SearchDto } from '@common/dtos';
import { ApiPaginationMeta } from '@nex-house/interfaces';
import {
  FindManyOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
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
  const { first, rows } = searchDto;

  const sortField = searchDto.sortField ? searchDto.sortField : 'createdAt';
  const sortOrder = searchDto.sortOrder === 1 ? 'ASC' : 'DESC';

  const totalRecordsInDb = await repository.count();

  const [data, total] = await repository.findAndCount({
    ...findOptions,
    skip: first, // Index to start from
    take: rows, // Number of records
    order: { [sortField]: sortOrder } as any,
  });

  return {
    data,
    meta: {
      total,
      page: Math.floor(first / rows) + 1,
      lastPage: Math.ceil(total / rows),
      limit: rows,
      existRecords: totalRecordsInDb > 0, // Se establece si existen registros
    },
  };
}

export async function paginateQuery<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  searchDto: SearchDto,
): Promise<PaginatedResult<T>> {
  const first = searchDto.first || 0;
  const rows = searchDto.rows || 10;
  const sortField = searchDto.sortField ? searchDto.sortField : 'createdAt';
  const sortOrder = searchDto.sortOrder === 1 ? 'ASC' : 'DESC';

  // const totalRecordsInDb = await query.repository.count();
  const mainAlias = query.expressionMap.mainAlias;
  const repository = query.connection.getRepository(mainAlias!.target);
  const totalRecordsInDb = await repository.count();

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
      existRecords: totalRecordsInDb > 0, // Se establece si existen registros
    },
  };
}
