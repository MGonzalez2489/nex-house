import {
  Neighborhood,
  NeighStreet,
  User,
} from '@core/database';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { ResidentSearchService, ResidentService } from '@administration/residents/services';
import { CatalogsService } from 'src/catalogs/services';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateNeighborhoodDto } from '../dtos';
import { NeighStreetService } from './neigh-street.service';
import { NeighborhoodSearchService } from './neighborhood-search.service';
import { NeighborhoodService } from './neighborhood.service';

describe('NeighborhoodService', () => {
  let service: NeighborhoodService;
  let mockNeighStreetService: jest.Mocked<NeighStreetService>;
  let mockSearchService: jest.Mocked<NeighborhoodSearchService>;
  let mockResidentService: jest.Mocked<ResidentService>;
  let mockResidentSearchService: jest.Mocked<ResidentSearchService>;
  let mockCatalogService: jest.Mocked<CatalogsService>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  let mockCacheManager: any;

  const mockUser = { id: 100 } as User;
  const mockDto: CreateNeighborhoodDto = {
    name: 'Residencial Del Real',
    adminEmail: 'admin@nexhouse.com',
    isActive: true,
    zipCode: '31000',
    cityId: 'city-uuid-1',
    streets: [{ name: 'Calle Primera' }, { name: 'Calle Segunda' }],
  };

  const mockSavedNeighborhood = {
    id: 1,
    publicId: 'neighborhood-uuid-1',
    name: 'residencial del real',
    createdBy: 100,
  } as Neighborhood;

  const mockSavedStreets = [
    { id: 10, name: 'calle primera', neighborhoodId: 1 },
    { id: 11, name: 'calle segunda', neighborhoodId: 1 },
  ] as NeighStreet[];

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        findOne: jest.fn(),
        create: jest.fn().mockImplementation((entity, data) => data),
        save: jest.fn(),
      },
    } as unknown as jest.Mocked<QueryRunner>;

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as unknown as jest.Mocked<DataSource>;

    mockNeighStreetService = {
      createMany: jest.fn(),
    } as unknown as jest.Mocked<NeighStreetService>;

    mockSearchService = {
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<NeighborhoodSearchService>;

    mockResidentService = {
      createFirstAdmin: jest.fn(),
    } as unknown as jest.Mocked<ResidentService>;

    mockResidentSearchService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<ResidentSearchService>;

    mockCatalogService = {
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<CatalogsService>;

    mockCacheManager = {
      store: {
        keys: jest.fn().mockResolvedValue([]),
      },
      del: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    mockResidentSearchService.findByEmail.mockResolvedValue(null);
    mockCatalogService.findByPublicId.mockResolvedValue({
      id: 5,
      publicId: 'city-uuid-1',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeighborhoodService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        { provide: NeighStreetService, useValue: mockNeighStreetService },
        {
          provide: NeighborhoodSearchService,
          useValue: mockSearchService,
        },
        { provide: ResidentService, useValue: mockResidentService },
        {
          provide: ResidentSearchService,
          useValue: mockResidentSearchService,
        },
        { provide: CatalogsService, useValue: mockCatalogService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<NeighborhoodService>(NeighborhoodService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a neighborhood and its streets atomically inside a successful transaction', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(
        mockSavedNeighborhood,
      );
      (mockSearchService.findByPublicId as jest.Mock).mockResolvedValue({
        ...mockSavedNeighborhood,
        streets: mockSavedStreets,
      });
      mockNeighStreetService.createMany.mockResolvedValue(mockSavedStreets);

      const result = await service.create(mockDto, mockUser);

      expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();

      expect(mockResidentSearchService.findByEmail).toHaveBeenCalledWith(
        mockDto.adminEmail,
      );
      expect(mockCatalogService.findByPublicId).toHaveBeenCalled();

      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(
        Neighborhood,
        {
          where: { name: 'residencial del real' },
        },
      );
      expect(mockCacheManager.store.keys).toHaveBeenCalledWith(
        'cache:/api/neighborhood*',
      );
      expect(result).toEqual({
        ...mockSavedNeighborhood,
        streets: mockSavedStreets,
      });
    });

    it('should delegate street creation and first admin creation to their services inside the transaction', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(
        mockSavedNeighborhood,
      );

      (mockSearchService.findByPublicId as jest.Mock).mockResolvedValue({
        ...mockSavedNeighborhood,
        streets: mockSavedStreets,
      });

      mockNeighStreetService.createMany.mockResolvedValue(mockSavedStreets);
      mockResidentService.createFirstAdmin.mockResolvedValue({ id: 200 } as any);

      const result = await service.create(mockDto, mockUser);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();

      expect(mockNeighStreetService.createMany).toHaveBeenCalledWith(
        [
          { name: 'calle primera', neighborhoodId: 1 },
          { name: 'calle segunda', neighborhoodId: 1 },
        ],
        mockUser.id,
        mockQueryRunner.manager,
      );
      expect(mockResidentService.createFirstAdmin).toHaveBeenCalledWith(
        1,
        mockDto.adminEmail,
        mockUser,
        mockQueryRunner.manager,
      );
      expect(result).toEqual({
        ...mockSavedNeighborhood,
        streets: mockSavedStreets,
      });
    });

    it('should throw BadRequestException without opening a transaction if the streets array is empty', async () => {
      const invalidDto = {
        name: 'Altares',
        adminEmail: 'admin@nexhouse.com',
        isActive: true,
        zipCode: '31000',
        cityId: 'city-uuid-1',
        streets: [],
      } as CreateNeighborhoodDto;

      await expect(service.create(invalidDto, mockUser)).rejects.toThrow(
        new BadRequestException(
          'At least one street validation string is required.',
        ),
      );

      expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('should throw ConflictException without opening a transaction if the admin email already exists', async () => {
      mockResidentSearchService.findByEmail.mockResolvedValue({ id: 9 } as any);

      await expect(service.create(mockDto, mockUser)).rejects.toThrow(
        new ConflictException('User admin@nexhouse.com already exists.'),
      );

      expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('should trigger a rollback and throw ConflictException if the neighborhood name already exists', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValue({
        id: 5,
        name: 'residencial del real',
      });

      await expect(service.create(mockDto, mockUser)).rejects.toThrow(
        new ConflictException(
          'Neighborhood name "Residencial Del Real" already resides in database registries.',
        ),
      );

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should trigger a rollback and wrap errors into InternalServerErrorException if saving processes crash', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);
      (mockQueryRunner.manager.save as jest.Mock).mockRejectedValue(
        new Error('Foreign key constraint violation constraint'),
      );

      await expect(service.create(mockDto, mockUser)).rejects.toThrow(
        new InternalServerErrorException(
          'Atomic operation failed during creation sequences.',
        ),
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
