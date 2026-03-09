import { Test, TestingModule } from '@nestjs/testing';
import { NeighborhoodsController } from './neighborhoods.controller';
import { NeighborhoodsService } from './neighborhoods.service';

describe('NeighborhoodsController', () => {
  let controller: NeighborhoodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeighborhoodsController],
      providers: [NeighborhoodsService],
    }).compile();

    controller = module.get<NeighborhoodsController>(NeighborhoodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
