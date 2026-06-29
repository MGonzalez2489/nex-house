import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NeighborhoodSearchService } from './neighborhood-search.service';
import { Neighborhood } from '@core/database';
import { SearchDto } from '@core/dtos';
import * as paginationUtils from '@core/utils';

// Intercept pagination module
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
    it('should return a wrapped paginated response object by default', async () => {
      const searchDto: SearchDto = {
        first: 0,
        rows: 10,
        sortField: '',
        sortOrder: 0,
        showAll: false,
      };
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      const result = await service.findAll(searchDto);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'neighborhood',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'neighborhood.streets',
        'streets',
      );
      expect(result).toEqual(mockPaginationResult);
    });

    it('should unpack and return the raw entity data array if raw: true is passed', async () => {
      const searchDto: SearchDto = {
        first: 0,
        rows: 10,
        sortField: '',
        sortOrder: 0,
        showAll: false,
      };
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      const result = await service.findAll(searchDto, { raw: true });

      expect(result).toEqual(mockNeighborhoods);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should append structured sub-brackets if globalFilter keywords are active', async () => {
      const searchDto: SearchDto = {
        first: 0,
        rows: 10,
        globalFilter: 'Palomas Del Real',
        sortField: '',
        sortOrder: 0,
        showAll: false,
      };
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      await service.findAll(searchDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });
  });

  describe('findOneByCriteria methods', () => {
    it('should query a single neighborhood by public ID using default relation scopes', async () => {
      mockRepository.findOne.mockResolvedValue(mockNeighborhoods[0]);

      const result = await service.findByPublicId('uuid-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'uuid-1' },
        relations: { streets: true },
      });
      expect(result).toEqual(mockNeighborhoods[0]);
    });

    it('should query a single neighborhood by name with customizable override relation mappings', async () => {
      const customRelations = { streets: false };
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByName('Las Palomas', customRelations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Las Palomas' },
        relations: customRelations,
      });
      expect(result).toBeNull();
    });
  });
});
