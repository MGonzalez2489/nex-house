import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NeighborhoodController } from './neighborhood.controller';
import {
  NeighborhoodSearchService,
  NeighborhoodService,
  NeighStreetService,
} from '../services';
import { SearchDto } from '@core/dtos';
import { PaginatedResult } from '@core/utils';
import { Neighborhood, NeighStreet, User } from '@core/database';
import { CreateNeighborhoodDto } from '../dtos';

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

  const mockPaginationResult: PaginatedResult<Neighborhood> = {
    data: [mockNeighborhood],
    meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
  };

  const mockStreetUuid = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  const mockStreet = {
    id: 10,
    publicId: mockStreetUuid,
    name: 'calle primera',
    neighborhoodId: 1,
  } as NeighStreet;

  beforeEach(async () => {
    mockSearchService = {
      findAll: jest.fn(),
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<NeighborhoodSearchService>;

    mockNeighborhoodService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<NeighborhoodService>;

    mockNeighStreetService = {
      createMany: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<NeighStreetService>;

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
      ],
    }).compile();

    controller = module.get<NeighborhoodController>(NeighborhoodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should invoke service orchestration to return paginated lists structures', async () => {
      const dto: SearchDto = {
        first: 0,
        rows: 10,
        sortField: '',
        sortOrder: 0,
        showAll: false,
      };
      mockSearchService.findAll.mockResolvedValue(mockPaginationResult);

      const result = await controller.findAll(dto);

      expect(mockSearchService.findAll).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPaginationResult);
    });
  });

  describe('findOne', () => {
    it('should yield matching entity states if target public identity resides in DB bounds', async () => {
      const testUuid = 'c9b0a7ed-20a2-4a0b-bf84-cf9537bc2c42';
      mockSearchService.findByPublicId.mockResolvedValue(mockNeighborhood);

      const result = await controller.findOne(testUuid);

      expect(mockSearchService.findByPublicId).toHaveBeenCalledWith(testUuid);
      expect(result).toEqual(mockNeighborhood);
    });

    it('should throw NotFoundException if service returns a null pointer reference', async () => {
      const missingUuid = '00000000-0000-0000-0000-000000000000';
      mockSearchService.findByPublicId.mockResolvedValue(null);

      await expect(controller.findOne(missingUuid)).rejects.toThrow(
        new NotFoundException(
          `Neighborhood profile with identity "${missingUuid}" does not exist.`,
        ),
      );
    });
  });

  describe('create', () => {
    it('should delegate payload records to the service layer and yield a 201 response status map', async () => {
      const createDto: CreateNeighborhoodDto = {
        name: 'Residencial Del Real',
        streets: ['Calle Primera'],
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
  //streets

  describe('findAll', () => {
    it('should invoke search service orchestration to return paginated lists structures', async () => {
      const dto: SearchDto = {
        first: 0,
        rows: 10,
        sortField: '',
        sortOrder: 0,
        showAll: false,
      };
      mockSearchService.findAll.mockResolvedValue(mockPaginationResult);

      const result = await controller.findAll(dto);

      expect(mockSearchService.findAll).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPaginationResult);
    });
  });

  describe('findOne', () => {
    it('should yield matching entity states if target public identity resides in DB bounds', async () => {
      mockSearchService.findByPublicId.mockResolvedValue(mockNeighborhood);

      const result = await controller.findOne(mockNeighborhoodUuid);

      expect(mockSearchService.findByPublicId).toHaveBeenCalledWith(
        mockNeighborhoodUuid,
      );
      expect(result).toEqual(mockNeighborhood);
    });

    it('should throw NotFoundException if parent context drops out of system registries', async () => {
      mockSearchService.findByPublicId.mockResolvedValue(null);

      await expect(controller.findOne(mockNeighborhoodUuid)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should delegate payload records to the execution layer and return state structures', async () => {
      const createDto: CreateNeighborhoodDto = {
        name: 'Residencial Del Real',
        streets: ['Calle Primera'],
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

  describe('addStreets', () => {
    it('should map independent strings entries and pass them to sub-service orchestration', async () => {
      mockSearchService.findByPublicId.mockResolvedValue(mockNeighborhood);
      mockNeighStreetService.createMany.mockResolvedValue([mockStreet]);

      const result = await controller.addStreets(mockNeighborhoodUuid, [
        'Calle Primera',
      ]);

      expect(mockSearchService.findByPublicId).toHaveBeenCalledWith(
        mockNeighborhoodUuid,
      );
      expect(mockNeighStreetService.createMany).toHaveBeenCalledWith([
        { name: 'calle primera', neighborhoodId: 1 },
      ]);
      expect(result).toEqual([mockStreet]);
    });

    it('should halt execution if parent neighborhood validation resolves to null pointer profiles', async () => {
      mockSearchService.findByPublicId.mockResolvedValue(null);

      await expect(
        controller.addStreets(mockNeighborhoodUuid, ['Calle Malformed']),
      ).rejects.toThrow(NotFoundException);
      expect(mockNeighStreetService.createMany).not.toHaveBeenCalled();
    });
  });

  describe('updateStreet', () => {
    it('should forward structural updates smoothly to the street domain handlers', async () => {
      mockNeighStreetService.update.mockResolvedValue(mockStreet);

      const result = await controller.updateStreet(
        mockStreetUuid,
        'Calle Nueva',
      );

      expect(mockNeighStreetService.update).toHaveBeenCalledWith(
        mockStreetUuid,
        'Calle Nueva',
      );
      expect(result).toEqual(mockStreet);
    });
  });

  describe('removeStreet', () => {
    it('should target specific entries for physical dismissal', async () => {
      mockNeighStreetService.remove.mockResolvedValue(undefined);

      await controller.removeStreet(mockStreetUuid);

      expect(mockNeighStreetService.remove).toHaveBeenCalledWith(
        mockStreetUuid,
      );
    });
  });
});
