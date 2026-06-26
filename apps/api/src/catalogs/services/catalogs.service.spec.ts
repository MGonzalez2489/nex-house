import { NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { CatalogsService } from './catalogs.service';
import { BaseCatalog } from '@core/database/entities/_base';

describe('CatalogsService', () => {
  let service: CatalogsService;
  let entityManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    // Create a mock structure for EntityManager with specific TypeORM methods
    const mockEntityManager = {
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogsService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<CatalogsService>(CatalogsService);
    entityManager = module.get(EntityManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of catalog records successfully', async () => {
      const expectedResult: BaseCatalog[] = [
        { id: 1, publicId: 'uuid-1', name: 'ACTIVE', displayName: 'Active' },
        {
          id: 2,
          publicId: 'uuid-2',
          name: 'INACTIVE',
          displayName: 'Inactive',
        },
      ];

      entityManager.find.mockResolvedValue(expectedResult);

      const result = await service.findAll(BaseCatalog);

      expect(entityManager.find).toHaveBeenCalledWith(BaseCatalog);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should return a record when a matching ID is found', async () => {
      const mockRecord: BaseCatalog = {
        id: 1,
        publicId: 'uuid-1',
        name: 'ACTIVE',
        displayName: 'Active',
      };
      entityManager.findOneBy.mockResolvedValue(mockRecord);

      const result = await service.findById(BaseCatalog, 1);

      expect(entityManager.findOneBy).toHaveBeenCalledWith(BaseCatalog, {
        id: 1,
      });
      expect(result).toEqual(mockRecord);
    });

    it('should throw a NotFoundException when no record matches the ID', async () => {
      entityManager.findOneBy.mockResolvedValue(null);

      await expect(service.findById(BaseCatalog, 99)).rejects.toThrow(
        new NotFoundException('BaseCatalog with ID 99 not found'),
      );
    });
  });

  describe('findByPublicId', () => {
    it('should return a record when a matching Public ID is found', async () => {
      const mockRecord: BaseCatalog = {
        id: 1,
        publicId: 'uuid-123',
        name: 'ACTIVE',
        displayName: 'Active',
      };
      entityManager.findOneBy.mockResolvedValue(mockRecord);

      const result = await service.findByPublicId(BaseCatalog, 'uuid-123');

      expect(entityManager.findOneBy).toHaveBeenCalledWith(BaseCatalog, {
        publicId: 'uuid-123',
      });
      expect(result).toEqual(mockRecord);
    });

    it('should throw a NotFoundException when no record matches the Public ID', async () => {
      entityManager.findOneBy.mockResolvedValue(null);

      await expect(
        service.findByPublicId(BaseCatalog, 'invalid-uuid'),
      ).rejects.toThrow(
        new NotFoundException(
          'BaseCatalog with Public ID invalid-uuid not found',
        ),
      );
    });
  });

  describe('findByName', () => {
    it('should return a record when a matching system name is found', async () => {
      const mockRecord: BaseCatalog = {
        id: 1,
        publicId: 'uuid-1',
        name: 'PENDING',
        displayName: 'Pending',
      };
      entityManager.findOneBy.mockResolvedValue(mockRecord);

      const result = await service.findByName(BaseCatalog, 'PENDING');

      expect(entityManager.findOneBy).toHaveBeenCalledWith(BaseCatalog, {
        name: 'PENDING',
      });
      expect(result).toEqual(mockRecord);
    });

    it('should throw a NotFoundException when no record matches the system name', async () => {
      entityManager.findOneBy.mockResolvedValue(null);

      await expect(service.findByName(BaseCatalog, 'UNKNOWN')).rejects.toThrow(
        new NotFoundException("BaseCatalog with Name 'UNKNOWN' not found"),
      );
    });
  });
});
