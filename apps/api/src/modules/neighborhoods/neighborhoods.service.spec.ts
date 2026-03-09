import { Neighborhood } from '@database/entities/neighborhood.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeighborhoodsService } from './neighborhoods.service';
import { CreateNeighborhoodDto } from './dtos';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockNeighborhood = {
  id: 1,
  publicId: 'uuid-123',
  name: 'Residencial Nex',
  slug: 'residencial-nex',
  address: 'Av. Siempre Viva 123',
};

describe('NeighborhoodsService', () => {
  let service: NeighborhoodsService;
  let repository: Repository<Neighborhood>;

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockNeighborhood),
    save: jest.fn().mockResolvedValue(mockNeighborhood),
    findOne: jest.fn(),
    findAndCount: jest.fn(), // Necesario para el helper de paginate
    merge: jest.fn().mockReturnValue(mockNeighborhood),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeighborhoodsService,
        {
          provide: getRepositoryToken(Neighborhood),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NeighborhoodsService>(NeighborhoodsService);
    repository = module.get<Repository<Neighborhood>>(
      getRepositoryToken(Neighborhood),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new neighborhood', async () => {
      const dto: CreateNeighborhoodDto = {
        name: 'Residencial Nex',
        slug: 'residencial-nex',
        address: 'Av. Siempre Viva 123',
      };

      mockRepository.findOne.mockResolvedValue(null); // No existe previo

      const result = await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: dto.slug },
      });
      expect(result).toEqual(mockNeighborhood);
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockNeighborhood);

      await expect(
        service.create({ slug: 'residencial-nex' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByPublicId', () => {
    it('should return a neighborhood if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockNeighborhood);

      const result = await service.findByPublicId('uuid-123');
      expect(result).toEqual(mockNeighborhood);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const response = await service.findByPublicId('non-existent');

      expect(response).toBeNull();
    });
  });

  describe('remove', () => {
    it('should call softDelete if neighborhood exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockNeighborhood);

      await service.remove('uuid-123');
      expect(mockRepository.softDelete).toHaveBeenCalledWith(
        mockNeighborhood.id,
      );
    });
  });
});
