import { Test, TestingModule } from '@nestjs/testing';
import { NeighSearchController } from './neigh-search.controller';

describe('NeighSearchController', () => {
  let controller: NeighSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeighSearchController],
    }).compile();

    controller = module.get<NeighSearchController>(NeighSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
