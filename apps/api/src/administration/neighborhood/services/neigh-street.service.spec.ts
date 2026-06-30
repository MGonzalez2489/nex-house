import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { NeighStreet } from '@core/database';
import { NeighStreetService } from './neigh-street.service';

describe('NeighStreetService', () => {
  let service: NeighStreetService;
  let mockRepository: jest.Mocked<Repository<NeighStreet>>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  const mockStreet = {
    id: 10,
    publicId: 'street-uuid-123',
    name: 'calle del real',
    neighborhoodId: 1,
  } as NeighStreet;

  beforeEach(async () => {
    mockEntityManager = {
      create: jest.fn().mockImplementation((entity, data) => data),
      save: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    mockRepository = {
      manager: mockEntityManager,
      findOneBy: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMany', () => {
    it('should fall back to repository manager if no external runner is supplied', async () => {
      const payload = [{ name: 'calle norte', neighborhoodId: 1 }];
      mockEntityManager.save.mockResolvedValue(payload as any);

      const result = await service.createMany(payload);

      expect(mockEntityManager.create).toHaveBeenCalledWith(
        NeighStreet,
        payload,
      );
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result).toEqual(payload);
    });

    it('should run under an explicit transactional manager if supplied', async () => {
      const customManager = {
        create: jest.fn().mockImplementation((entity, data) => data),
        save: jest.fn().mockResolvedValue(['transacted-value']),
      } as unknown as jest.Mocked<EntityManager>;

      const payload = [{ name: 'calle sur', neighborhoodId: 1 }];
      const result = await service.createMany(payload, customManager);

      expect(customManager.create).toHaveBeenCalled();
      expect(customManager.save).toHaveBeenCalled();
      expect(mockEntityManager.save).not.toHaveBeenCalled();
      expect(result).toEqual(['transacted-value']);
    });
  });

  describe('update', () => {
    it('should save mutated string profiles successfully', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStreet);
      mockRepository.save.mockImplementation(async (entity: any) => entity);

      const result = await service.update(
        'street-uuid-123',
        ' Nueva Calle Capitalizada ',
      );

      expect(result.name).toBe('nueva calle capitalizada');
      expect(mockRepository.save).toHaveBeenCalledWith(mockStreet);
    });

    it('should throw NotFoundException if lookup target drops out of system bounds', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('invalid-id', 'test')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should trigger physical erasure if target row maps successfully', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStreet);
      mockRepository.remove.mockResolvedValue(mockStreet);

      await service.remove('street-uuid-123');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockStreet);
    });
  });
});
