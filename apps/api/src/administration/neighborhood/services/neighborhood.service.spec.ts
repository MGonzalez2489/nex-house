import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { NeighborhoodService } from './neighborhood.service';
import { Neighborhood, NeighStreet, User } from '@core/database';
import { CreateNeighborhoodDto } from '../dtos';

describe('NeighborhoodService', () => {
  let service: NeighborhoodService;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  const mockUser = { id: 100 } as User;
  const mockDto: CreateNeighborhoodDto = {
    name: 'Residencial Del Real',
    streets: ['Calle Primera', 'Calle Segunda'],
  };

  const mockSavedNeighborhood = {
    id: 1,
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeighborhoodService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
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
      (mockQueryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(mockSavedNeighborhood)
        .mockResolvedValueOnce(mockSavedStreets);

      const result = await service.create(mockDto, mockUser);

      expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();

      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(
        Neighborhood,
        {
          where: { name: 'residencial del real' },
        },
      );
      expect(result).toEqual({
        ...mockSavedNeighborhood,
        streets: mockSavedStreets,
      });
    });

    it('should throw BadRequestException without opening a transaction if the streets array is empty', async () => {
      const invalidDto = { name: 'Altares', streets: [] };

      await expect(service.create(invalidDto, mockUser)).rejects.toThrow(
        new BadRequestException(
          'At least one street validation string is required.',
        ),
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
