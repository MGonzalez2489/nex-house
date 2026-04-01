import { Test, TestingModule } from '@nestjs/testing';
import { NeighFinanceController } from './neigh-finance.controller';
import { NeighFinanceService } from './neigh-finance.service';

describe('NeighFinanceController', () => {
  let controller: NeighFinanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeighFinanceController],
      providers: [NeighFinanceService],
    }).compile();

    controller = module.get<NeighFinanceController>(NeighFinanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
