import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NeighborhoodSearchService } from './neighborhood-search.service';
import { Neighborhood } from '@core/database';
import { SearchNeighDto } from '../dtos';
import * as paginationUtils from '@core/utils';

jest.mock('@core/utils', () => ({
  ...jest.requireActual('@core/utils'),
  paginateQuery: jest.fn(),
}));

describe('NeighborhoodSearchService', () => {
  let service: NeighborhoodSearchService;
  let mockRepository: jest.Mocked<Repository<Neighborhood>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Neighborhood>>;

  const mockNeighborhoods: Neighborhood[] = [
    { id: 1, publicId: 'uuid-1', name: 'Las Palomas' } as Neighborhood,
  ];

  const mockPaginationResult = {
    data: mockNeighborhoods,
    meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Neighborhood>>;

    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Neighborhood>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeighborhoodSearchService,
        {
          provide: getRepositoryToken(Neighborhood),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NeighborhoodSearchService>(NeighborhoodSearchService);
    jest.mocked(paginationUtils.paginateQuery).mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const baseDto = (): SearchNeighDto => ({
      first: 0,
      rows: 10,
      sortField: 'createdAt',
      sortOrder: -1,
      showAll: false,
    });

    it('returns the paginated wrapper by default', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      const result = await service.findAll(baseDto());

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'neighborhood',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'neighborhood.streets',
        'streets',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'neighborhood.address',
        'address',
      );
      expect(result).toEqual(mockPaginationResult);
    });

    it('filters by activation state when isActive is provided', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      await service.findAll({ ...baseDto(), isActive: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'neighborhood.isActive = :isActive',
        { isActive: true },
      );
    });

    it('applies the global name filter when provided', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      await service.findAll({ ...baseDto(), globalFilter: 'palomas' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });

    it('returns raw entity rows when options.raw is true', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      const result = await service.findAll(baseDto(), { raw: true });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockNeighborhoods);
    });
  });

  describe('single-row lookups', () => {
    it('finds by publicId using default relation scopes', async () => {
      mockRepository.findOne.mockResolvedValue(mockNeighborhoods[0]);

      const result = await service.findByPublicId('uuid-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'uuid-1' },
        relations: { streets: true },
      });
      expect(result).toEqual(mockNeighborhoods[0]);
    });

    it('finds by name with a custom relation override', async () => {
      const customRelations = { streets: false };
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByName('Las Palomas', customRelations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Las Palomas' },
        relations: customRelations,
      });
      expect(result).toBeNull();
    });

    it('finds by numeric id', async () => {
      const customRelations = { streets: false };
      mockRepository.findOne.mockResolvedValue(mockNeighborhoods[0]);

      const result = await service.findById(1, customRelations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: customRelations,
      });
      expect(result).toEqual(mockNeighborhoods[0]);
    });
  });
});