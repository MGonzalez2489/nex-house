import { NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { EntityManager, EntityTarget, FindManyOptions } from 'typeorm';
import { CatalogsService } from './catalogs.service';
import { BaseCatalog } from '@core/database/entities/_base';

describe('CatalogsService', () => {
  let service: CatalogsService;

  const mockEntityManager = {
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  const catalogRecord: BaseCatalog = {
    id: 1,
    publicId: 'uuid-1',
    name: 'ACTIVE',
    displayName: 'Active',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of catalog records', async () => {
      const expectedResult: BaseCatalog[] = [
        catalogRecord,
        {
          id: 2,
          publicId: 'uuid-2',
          name: 'INACTIVE',
          displayName: 'Inactive',
        },
      ];
      mockEntityManager.find.mockResolvedValue(expectedResult);

      const result = await service.findAll(BaseCatalog);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        BaseCatalog,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should forward the provided find options to the entity manager', async () => {
      const findOptions: FindManyOptions<BaseCatalog> = {
        where: { name: 'ACTIVE' },
      };
      mockEntityManager.find.mockResolvedValue([catalogRecord]);

      const result = await service.findAll(BaseCatalog, findOptions);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        BaseCatalog,
        findOptions,
      );
      expect(result).toEqual([catalogRecord]);
    });
  });

  describe('findById', () => {
    it('should return a record when a matching ID is found', async () => {
      mockEntityManager.findOneBy.mockResolvedValue(catalogRecord);

      const result = await service.findById(BaseCatalog, 1);

      expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(BaseCatalog, {
        id: 1,
      });
      expect(result).toEqual(catalogRecord);
    });

    it('should throw a NotFoundException when no record matches the ID', async () => {
      mockEntityManager.findOneBy.mockResolvedValue(null);

      await expect(service.findById(BaseCatalog, 99)).rejects.toThrow(
        new NotFoundException('BaseCatalog with ID 99 not found'),
      );
    });

    it('should fall back to the generic name when the target is not a class', async () => {
      mockEntityManager.findOneBy.mockResolvedValue(null);

      await expect(
        service.findById('unknown_table' as EntityTarget<BaseCatalog>, 7),
      ).rejects.toThrow(new NotFoundException('Catalog with ID 7 not found'));
    });
  });

  describe('findByPublicId', () => {
    it('should return a record when a matching Public ID is found', async () => {
      mockEntityManager.findOneBy.mockResolvedValue(catalogRecord);

      const result = await service.findByPublicId(BaseCatalog, 'uuid-1');

      expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(BaseCatalog, {
        publicId: 'uuid-1',
      });
      expect(result).toEqual(catalogRecord);
    });

    it('should throw a NotFoundException when no record matches the Public ID', async () => {
      mockEntityManager.findOneBy.mockResolvedValue(null);

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
      mockEntityManager.findOneBy.mockResolvedValue(catalogRecord);

      const result = await service.findByName(BaseCatalog, 'ACTIVE');

      expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(BaseCatalog, {
        name: 'ACTIVE',
      });
      expect(result).toEqual(catalogRecord);
    });

    it('should throw a NotFoundException when no record matches the system name', async () => {
      mockEntityManager.findOneBy.mockResolvedValue(null);

      await expect(service.findByName(BaseCatalog, 'UNKNOWN')).rejects.toThrow(
        new NotFoundException("BaseCatalog with Name 'UNKNOWN' not found"),
      );
    });
  });
});
