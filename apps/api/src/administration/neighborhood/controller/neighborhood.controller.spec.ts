import { Test, TestingModule } from '@nestjs/testing';
import { NeighborhoodController } from './neighborhood.controller';
import {
  NeighborhoodSearchService,
  NeighborhoodService,
  NeighStreetService,
} from '../services';
import { Neighborhood, User } from '@core/database';
import { CreateNeighborhoodDto, UpdateNeighborhoodDto } from '../dtos';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';

describe('NeighborhoodController', () => {
  let controller: NeighborhoodController;
  let mockSearchService: jest.Mocked<NeighborhoodSearchService>;
  let mockNeighborhoodService: jest.Mocked<NeighborhoodService>;
  let mockNeighStreetService: jest.Mocked<NeighStreetService>;

  const mockUser = { id: 100 } as User;

  const mockNeighborhoodUuid = 'c9b0a7ed-20a2-4a0b-bf84-cf9537bc2c42';
  const mockNeighborhood = {
    id: 1,
    publicId: mockNeighborhoodUuid,
    name: 'residencial del real',
    createdBy: 100,
    streets: [{ id: 10, name: 'calle primera', neighborhoodId: 1 }],
  } as Neighborhood;

  beforeEach(async () => {
    mockSearchService = {
      findAll: jest.fn(),
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<NeighborhoodSearchService>;

    mockNeighborhoodService = {
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<NeighborhoodService>;

    mockNeighStreetService = {} as unknown as jest.Mocked<NeighStreetService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeighborhoodController],
      providers: [
        {
          provide: NeighborhoodSearchService,
          useValue: mockSearchService,
        },
        {
          provide: NeighborhoodService,
          useValue: mockNeighborhoodService,
        },
        { provide: NeighStreetService, useValue: mockNeighStreetService },
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get<NeighborhoodController>(NeighborhoodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates the payload to the service and returns the created neighborhood', async () => {
      const createDto: CreateNeighborhoodDto = {
        name: 'Residencial Del Real',
        streets: [{ name: 'Calle Primera' }],
        adminEmail: 'admin@residencial.com',
        isActive: true,
        zipCode: '32000',
        cityId: 'city-uuid',
      };

      mockNeighborhoodService.create.mockResolvedValue(mockNeighborhood);

      const result = await controller.create(createDto, mockUser);

      expect(mockNeighborhoodService.create).toHaveBeenCalledWith(
        createDto,
        mockUser,
      );
      expect(result).toEqual(mockNeighborhood);
    });
  });

  describe('update', () => {
    it('delegates the public ID and payload to the service and returns the updated neighborhood', async () => {
      const updateDto: UpdateNeighborhoodDto = {
        name: 'Residencial Del Real Norte',
      };
      mockNeighborhoodService.update.mockResolvedValue(mockNeighborhood);

      const result = await controller.update(
        mockNeighborhoodUuid,
        updateDto,
        mockUser,
      );

      expect(mockNeighborhoodService.update).toHaveBeenCalledWith(
        mockNeighborhoodUuid,
        updateDto,
        mockUser,
      );
      expect(result).toEqual(mockNeighborhood);
    });
  });
});