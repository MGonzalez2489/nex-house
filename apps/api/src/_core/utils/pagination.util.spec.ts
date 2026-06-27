import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { paginate, paginateQuery } from './pagination.util'; // Adjust path accordingly
import { SearchDto } from '@core/dtos';

class MockEntity implements ObjectLiteral {
  id: number;
  createdAt: Date;
}

describe('Pagination Utilities', () => {
  let mockSearchDto: SearchDto;

  beforeEach(() => {
    mockSearchDto = {
      first: 0,
      rows: 10,
      sortField: 'createdAt',
      sortOrder: 1, // 1 for ASC, -1 for DESC
      showAll: false,
    };
  });

  describe('paginate', () => {
    let mockRepository: jest.Mocked<Repository<MockEntity>>;

    beforeEach(() => {
      mockRepository = {
        findAndCount: jest.fn(),
      } as unknown as jest.Mocked<Repository<MockEntity>>;
    });

    it('should successfully return paginated data and meta headers for the first page', async () => {
      const mockEntities: MockEntity[] = [{ id: 1, createdAt: new Date() }];
      const mockTotal = 25; // 25 total records in DB

      mockRepository.findAndCount.mockResolvedValue([mockEntities, mockTotal]);

      const result = await paginate(mockRepository, mockSearchDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'ASC' },
      });

      expect(result).toEqual({
        data: mockEntities,
        meta: {
          total: 25,
          page: 1,
          lastPage: 3,
          limit: 10,
        },
      });
    });

    it('should calculate the current page and handle DESC sorting correctly', async () => {
      mockSearchDto.first = 10; // Page 2 start index
      mockSearchDto.sortOrder = -1; // DESC

      mockRepository.findAndCount.mockResolvedValue([[], 25]);

      const result = await paginate(mockRepository, mockSearchDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.meta.page).toBe(2);
    });
  });

  describe('paginateQuery', () => {
    let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<MockEntity>>;

    beforeEach(() => {
      // Mocking the chainable fluent API of SelectQueryBuilder
      mockQueryBuilder = {
        alias: 'mockEntity',
        expressionMap: {
          mainAlias: {
            target: MockEntity,
          },
        },
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      } as unknown as jest.Mocked<SelectQueryBuilder<MockEntity>>;
    });

    it('should apply pagination and custom alias ordering to QueryBuilder successfully', async () => {
      const mockEntities: MockEntity[] = [{ id: 99, createdAt: new Date() }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEntities, 15]);

      const result = await paginateQuery(mockQueryBuilder, mockSearchDto);

      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'mockEntity.createdAt',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data).toEqual(mockEntities);
      expect(result.meta.lastPage).toBe(2);
    });

    it('should fetch all records without applying skip/take when showAll flag is true', async () => {
      mockSearchDto.showAll = true;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 50]);

      await paginateQuery(mockQueryBuilder, mockSearchDto);

      expect(mockQueryBuilder.skip).not.toHaveBeenCalled();
      expect(mockQueryBuilder.take).not.toHaveBeenCalled();
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });

    it('should throw an error if the QueryBuilder does not have a valid main alias context', async () => {
      mockQueryBuilder.expressionMap.mainAlias = undefined;

      await expect(
        paginateQuery(mockQueryBuilder, mockSearchDto),
      ).rejects.toThrow(
        new Error('QueryBuilder must have a main alias execution context'),
      );
    });
  });
});
