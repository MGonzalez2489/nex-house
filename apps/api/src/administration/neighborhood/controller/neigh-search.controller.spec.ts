import { Test, TestingModule } from '@nestjs/testing';
import { NeighSearchController } from './neigh-search.controller';
import {
  NeighborhoodSearchService,
  NeighStreetService,
} from '../services';
import { NotFoundException } from '@nestjs/common';
import { Neighborhood, NeighStreet, User } from '@core/database';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { SearchNeighDto } from '../dtos';
import { SearchDto } from '@core/dtos';
import { NeighborhoodModel } from '@nexhouse/shared-domain/models';

describe('NeighSearchController', () => {
  let controller: NeighSearchController;
  let mockSearchService: jest.Mocked<NeighborhoodSearchService>;
  let mockNeighStreetService: jest.Mocked<NeighStreetService>;

  const mockUserUuid = 'c9b0a7ed-20a2-4a0b-bf84-cf9537bc2c42';
  const mockUser = {
    id: 100,
    neighborhoodId: 1,
  } as User;

  const mockNeighborhood = {
    id: 1,
    publicId: mockUserUuid,
    name: 'residencial del real',
    isActive: true,
    streets: [{ id: 10, name: 'calle primera', neighborhoodId: 1 }],
  } as Neighborhood;

  const mockPaginatedNeighborhoods = {
    data: [mockNeighborhood],
    meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
  };

  const mockStreet = {
    id: 10,
    publicId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'calle primera',
    neighborhoodId: 1,
  } as NeighStreet;

  const mockPaginatedStreets = {
    data: [mockStreet],
    meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
  };

  beforeEach(async () => {
    mockSearchService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<NeighborhoodSearchService>;

    mockNeighStreetService = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<NeighStreetService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeighSearchController],
      providers: [
        { provide: NeighborhoodSearchService, useValue: mockSearchService },
        { provide: NeighStreetService, useValue: mockNeighStreetService },
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get<NeighSearchController>(NeighSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('maps neighborhoods to models and returns the paginated wrapper', async () => {
      const dto: SearchNeighDto = {
        first: 0,
        rows: 10,
        sortField: 'createdAt',
        sortOrder: -1,
        showAll: false,
      };
      mockSearchService.findAll.mockResolvedValue(
        mockPaginatedNeighborhoods as never,
      );

      const result = await controller.findAll(dto);

      expect(mockSearchService.findAll).toHaveBeenCalledWith(dto);
      expect(result.meta).toEqual(mockPaginatedNeighborhoods.meta);
      expect(result.data).toHaveLength(1);
      expect((result.data[0] as NeighborhoodModel).publicId).toBe(
        mockUserUuid,
      );
      expect((result.data[0] as NeighborhoodModel).name).toBe(
        'residencial del real',
      );
    });
  });

  describe('findMine', () => {
    it('resolves the assigned neighborhood mapped to the API model', async () => {
      mockSearchService.findById.mockResolvedValue(mockNeighborhood);

      const result = await controller.findMine(mockUser);

      expect(mockSearchService.findById).toHaveBeenCalledWith(
        mockUser.neighborhoodId,
        { streets: true, address: { city: { state: true } } },
      );
      expect(result).toEqual({
        publicId: mockNeighborhood.publicId,
        name: mockNeighborhood.name,
        isActive: mockNeighborhood.isActive,
        streets: [{ publicId: undefined, name: 'calle primera' }],
        address: undefined,
      });
    });

    it('throws NotFoundException when the user has no assigned neighborhood', async () => {
      mockSearchService.findById.mockResolvedValue(null);

      await expect(controller.findMine(mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findStreets', () => {
    it('delegates to the street service scoped to the current neighborhood', async () => {
      const filters = new SearchDto();
      mockNeighStreetService.findAll.mockResolvedValue(
        mockPaginatedStreets as never,
      );

      const result = await controller.findStreets(filters, mockUser);

      expect(mockNeighStreetService.findAll).toHaveBeenCalledWith(
        mockUser.neighborhoodId,
        filters,
      );
      expect(result).toEqual(mockPaginatedStreets);
    });
  });

  describe('findOne', () => {
    it('returns the neighborhood mapped to the API model', async () => {
      mockSearchService.findByPublicId.mockResolvedValue(mockNeighborhood);

      const result = await controller.findOne(mockUserUuid);

      expect(mockSearchService.findByPublicId).toHaveBeenCalledWith(
        mockUserUuid,
        { streets: true, address: { city: { state: true } } },
      );
      expect(result).toEqual({
        publicId: mockNeighborhood.publicId,
        name: mockNeighborhood.name,
        isActive: mockNeighborhood.isActive,
        streets: [{ publicId: undefined, name: 'calle primera' }],
        address: undefined,
      });
    });

    it('throws NotFoundException when the public ID does not match', async () => {
      mockSearchService.findByPublicId.mockResolvedValue(null);

      await expect(controller.findOne(mockUserUuid)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});