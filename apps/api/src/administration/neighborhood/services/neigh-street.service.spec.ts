import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { NeighStreet } from '@core/database';
import { NeighStreetService } from './neigh-street.service';
import * as paginationUtils from '@core/utils';

jest.mock('@core/utils', () => ({
  ...jest.requireActual('@core/utils'),
  paginateQuery: jest.fn(),
}));

describe('NeighStreetService', () => {
  let service: NeighStreetService;
  let mockRepository: jest.Mocked<Repository<NeighStreet>>;
  let mockManager: jest.Mocked<EntityManager>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<NeighStreet>>;

  const mockStreet = {
    id: 10,
    publicId: 'street-uuid-123',
    name: 'calle del real',
    neighborhoodId: 1,
  } as NeighStreet;

  beforeEach(async () => {
    mockManager = {
      create: jest.fn().mockImplementation((_entity, data) => data),
      save: jest.fn(),
      find: jest.fn(),
      softRemove: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<SelectQueryBuilder<NeighStreet>>;

    mockRepository = {
      manager: mockManager,
      findOneBy: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    } as unknown as jest.Mocked<Repository<NeighStreet>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeighStreetService,
        {
          provide: getRepositoryToken(NeighStreet),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NeighStreetService>(NeighStreetService);
    jest.mocked(paginationUtils.paginateQuery).mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMany', () => {
    it('uses the repository manager by default and normalizes names', async () => {
      const payload = [{ name: ' Calle Norte ', neighborhoodId: 1 }];
      mockManager.save.mockResolvedValue(payload as never);

      const result = await service.createMany(payload, 5);

      expect(mockManager.create).toHaveBeenCalledWith(NeighStreet, [
        { name: 'calle norte', neighborhoodId: 1, createdBy: 5 },
      ]);
      expect(mockManager.save).toHaveBeenCalled();
      expect(result).toEqual(payload);
    });

    it('runs under an explicit transactional manager when supplied', async () => {
      const customManager = {
        create: jest.fn().mockImplementation((_entity, data) => data),
        save: jest.fn().mockResolvedValue(['transacted']),
      } as unknown as jest.Mocked<EntityManager>;

      const payload = [{ name: 'calle sur', neighborhoodId: 1 }];
      const result = await service.createMany(payload, 5, customManager);

      expect(customManager.create).toHaveBeenCalled();
      expect(customManager.save).toHaveBeenCalled();
      expect(mockManager.save).not.toHaveBeenCalled();
      expect(result).toEqual(['transacted']);
    });
  });

  describe('update', () => {
    it('normalizes and persists the new name', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStreet);
      (mockRepository.save as unknown as jest.Mock).mockImplementation(
        async (entity: NeighStreet) => entity,
      );

      const result = await service.update(
        'street-uuid-123',
        ' Nueva Calle Capitalizada ',
        7,
      );

      expect(result.name).toBe('nueva calle capitalizada');
      expect(result.updatedBy).toBe(7);
      expect(mockRepository.save).toHaveBeenCalledWith(mockStreet);
    });

    it('throws NotFoundException when the street does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', 'test', 7),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMany', () => {
    it('creates partial entities and saves them via the manager', async () => {
      const payload = [{ id: 1, name: ' Calle Nueva ' }];
      mockManager.save.mockResolvedValue(payload as never);

      const result = await service.updateMany(payload, 7);

      expect(mockManager.create).toHaveBeenCalledWith(NeighStreet, [
        { id: 1, name: 'calle nueva', updatedBy: 7 },
      ]);
      expect(mockManager.save).toHaveBeenCalled();
      expect(result).toEqual(payload);
    });
  });

  describe('remove', () => {
    it('soft-deletes the street stamps the actor', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStreet);
      mockRepository.save.mockResolvedValue(mockStreet);
      mockRepository.softRemove.mockResolvedValue(mockStreet);

      await service.remove('street-uuid-123', 9);

      expect(mockStreet.deletedBy).toBe(9);
      expect(mockRepository.save).toHaveBeenCalledWith(mockStreet);
      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockStreet);
    });

    it('throws NotFoundException when the street does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('invalid-id', 9)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeMany', () => {
    it('does nothing for an empty id list', async () => {
      await service.removeMany([], 9);

      expect(mockManager.find).not.toHaveBeenCalled();
      expect(mockManager.softRemove).not.toHaveBeenCalled();
    });

    it('soft-deletes matching streets via the manager', async () => {
      const streets = [
        { id: 1, name: 'calle a' },
        { id: 2, name: 'calle b' },
      ] as NeighStreet[];
      mockManager.find.mockResolvedValue(streets);
      mockManager.save.mockResolvedValue(streets as never);
      mockManager.softRemove.mockResolvedValue(streets as never);

      await service.removeMany([1, 2], 9);

      expect(mockManager.find).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(streets);
      expect(mockManager.softRemove).toHaveBeenCalledWith(
        NeighStreet,
        streets,
      );
    });
  });

  describe('findAll', () => {
    it('filters by neighborhood and supports term-based name matching', async () => {
      const filters = {
        first: 0,
        rows: 10,
        globalFilter: 'calle real',
      };
      const paginationResult = { data: [mockStreet], meta: {} };
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(paginationResult as never);

      const result = await service.findAll(1, filters as never);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('street');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'street.neighborhoodId = :neighborhoodId',
        { neighborhoodId: 1 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(result).toEqual(paginationResult);
    });

    it('skips the name filters when no global filter is present', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue({ data: [], meta: {} } as never);

      await service.findAll(1, { first: 0, rows: 10 } as never);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });
});