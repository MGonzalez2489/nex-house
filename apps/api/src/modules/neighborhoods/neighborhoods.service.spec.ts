import { Neighborhood } from '@database/entities/neighborhood.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeighborhoodsService } from './neighborhoods.service';

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
});
