import { Test, TestingModule } from '@nestjs/testing';
import { NeighborhoodsController } from './neighborhoods.controller';
import { NeighborhoodsService } from './neighborhoods.service';
import { SearchDto } from '@common/dtos';
import { CreateNeighborhoodDto } from './dtos';

const mockNeighborhood = {
  publicId: 'uuid-123',
  name: 'NexHouse Complex',
  slug: 'nexhouse-complex',
} as any;

describe('NeighborhoodsController', () => {
  let controller: NeighborhoodsController;
  let service: NeighborhoodsService;

  const mockService = {
    create: jest.fn().mockResolvedValue(mockNeighborhood),
    findAll: jest
      .fn()
      .mockResolvedValue({ data: [mockNeighborhood], meta: {} }),
    findByPublicId: jest.fn().mockResolvedValue(mockNeighborhood),
    update: jest.fn().mockResolvedValue(mockNeighborhood),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeighborhoodsController],
      providers: [
        {
          provide: NeighborhoodsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NeighborhoodsController>(NeighborhoodsController);
    service = module.get<NeighborhoodsService>(NeighborhoodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const dto: CreateNeighborhoodDto = {
        name: 'Nex',
        slug: 'nex',
        address: '123',
      };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockNeighborhood);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with searchDto', async () => {
      const searchDto: SearchDto = {
        first: 0,
        rows: 10,
        sortField: 'createdAt',
        sortOrder: -1,
      };
      await controller.findAll(searchDto);
      expect(service.findAll).toHaveBeenCalledWith(searchDto);
    });
  });

  describe('findOne', () => {
    it('should call service.findByPublicId with the given UUID', async () => {
      const uuid = 'uuid-123';
      await controller.findOne(uuid);
      expect(service.findByPublicId).toHaveBeenCalledWith(uuid);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return undefined', async () => {
      const uuid = 'uuid-123';
      await controller.remove(uuid);
      expect(service.remove).toHaveBeenCalledWith(uuid);
    });
  });
});

// describe('NeighborhoodsController', () => {
//   let controller: NeighborhoodsController;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [NeighborhoodsController],
//       providers: [
//         {
//           provide: NeighborhoodsService,
//           useValue: {},
//         },
//       ],
//     }).compile();
//
//     controller = module.get<NeighborhoodsController>(NeighborhoodsController);
//   });
//
//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
