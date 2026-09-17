import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Unit } from '@core/database';
import { SearchDto } from '@core/dtos';
import * as paginationUtils from '@core/utils';
import { UnitSearchService } from './unit-search.service';

jest.mock('@core/utils', () => ({
  ...jest.requireActual('@core/utils'),
  paginateQuery: jest.fn(),
}));

describe('UnitSearchService', () => {
  let service: UnitSearchService;
  let mockRepository: jest.Mocked<Repository<Unit>>;

  const mockUnit = {
    id: 1,
    publicId: 'unit-uuid',
    identifier: 'A-101',
    neighborhoodId: 10,
  } as Unit;

  const buildSearchDto = (overrides: Partial<SearchDto> = {}): SearchDto =>
    Object.assign(new SearchDto(), {
      first: 0,
      rows: 10,
      showAll: false,
      ...overrides,
    });

  beforeEach(async () => {
    jest.clearAllMocks();

    mockRepository = {
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<Unit>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitSearchService,
        {
          provide: getRepositoryToken(Unit),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UnitSearchService>(UnitSearchService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Unit>>;
    const mockPaginationResult = {
      data: [mockUnit],
      meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
    };

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
      } as unknown as jest.Mocked<SelectQueryBuilder<Unit>>;

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      jest.mocked(paginationUtils.paginateQuery).mockReset();
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);
    });

    it('builds a neighborhood-scoped query with the unit relations', async () => {
      const result = await service.findAll(buildSearchDto(), 10);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('units');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'units.street',
        'street',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'units.type',
        'type',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'units.userUnits',
        'userUnits',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'units.neighborhoodId = :neighborhoodId',
        { neighborhoodId: 10 },
      );
      expect(result).toEqual(mockPaginationResult);
    });

    it('does not filter when globalFilter is absent', async () => {
      await service.findAll(buildSearchDto(), 10);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('applies a grouped identifier/street filter when globalFilter is provided', async () => {
      await service.findAll(buildSearchDto({ globalFilter: 'roma' }), 10);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Brackets),
      );
    });
  });

  describe('findStats', () => {
    const buildStatsQueryMock = (
      rows: { name: string; count: string }[],
    ): jest.Mocked<SelectQueryBuilder<Unit>> =>
      ({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rows),
      }) as unknown as jest.Mocked<SelectQueryBuilder<Unit>>;

    it('aggregates counts by status, type and street', async () => {
      const statusQuery = buildStatsQueryMock([
        { name: 'Ocupado', count: '4' },
        { name: 'Sin habitar', count: '6' },
      ]);
      const typeQuery = buildStatsQueryMock([{ name: 'Casa', count: '10' }]);
      const streetQuery = buildStatsQueryMock([
        { name: 'roma', count: '7' },
        { name: 'juarez', count: '3' },
      ]);

      mockRepository.createQueryBuilder
        .mockReturnValueOnce(statusQuery)
        .mockReturnValueOnce(typeQuery)
        .mockReturnValueOnce(streetQuery);

      const result = await service.findStats(10);

      expect(result).toEqual({
        summary: { totalUnits: 10 },
        byStatus: { Ocupado: 4, 'Sin habitar': 6 },
        byType: { Casa: 10 },
        byStreet: { roma: 7, juarez: 3 },
      });

      expect(statusQuery.innerJoin).toHaveBeenCalledWith(
        'unit.status',
        'status',
      );
      expect(typeQuery.innerJoin).toHaveBeenCalledWith('unit.type', 'type');
      expect(streetQuery.innerJoin).toHaveBeenCalledWith(
        'unit.street',
        'street',
      );
    });

    it('scopes all aggregation queries to the neighborhood', async () => {
      const statusQuery = buildStatsQueryMock([]);
      const typeQuery = buildStatsQueryMock([]);
      const streetQuery = buildStatsQueryMock([]);

      mockRepository.createQueryBuilder
        .mockReturnValueOnce(statusQuery)
        .mockReturnValueOnce(typeQuery)
        .mockReturnValueOnce(streetQuery);

      await service.findStats(10);

      for (const query of [statusQuery, typeQuery, streetQuery]) {
        expect(query.where).toHaveBeenCalledWith(
          'unit.neighborhoodId = :neighborhoodId',
          { neighborhoodId: 10 },
        );
      }
    });

    it('returns empty aggregates when there are no units', async () => {
      mockRepository.createQueryBuilder
        .mockReturnValueOnce(buildStatsQueryMock([]))
        .mockReturnValueOnce(buildStatsQueryMock([]))
        .mockReturnValueOnce(buildStatsQueryMock([]));

      const result = await service.findStats(10);

      expect(result).toEqual({
        summary: { totalUnits: 0 },
        byStatus: {},
        byType: {},
        byStreet: {},
      });
    });
  });
});
