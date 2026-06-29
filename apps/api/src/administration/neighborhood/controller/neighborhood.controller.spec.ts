import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NeighborhoodController } from './neighborhood.controller';
import { NeighborhoodSearchService } from '../services';
import { SearchDto } from '@core/dtos';
import { PaginatedResult } from '@core/utils';
import { Neighborhood } from '@core/database';

describe('NeighborhoodController', () => {
  let controller: NeighborhoodController;
  let mockSearchService: jest.Mocked<NeighborhoodSearchService>;

  const mockNeighborhood = {
    id: 1,
    publicId: 'c9b0a7ed-20a2-4a0b-bf84-cf9537bc2c42',
    name: 'Residencial Del Real',
  } as Neighborhood;

  const mockPaginationResult: PaginatedResult<Neighborhood> = {
    data: [mockNeighborhood],
    meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
  };

  beforeEach(async () => {
    mockSearchService = {
      findAll: jest.fn(),
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<NeighborhoodSearchService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeighborhoodController],
      providers: [
        {
          provide: NeighborhoodSearchService,
          useValue: mockSearchService,
        },
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
});
