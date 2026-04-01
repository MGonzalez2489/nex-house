import { Test, TestingModule } from '@nestjs/testing';
import { NeighFinanceService } from './neigh-finance.service';

describe('NeighFinanceService', () => {
  let service: NeighFinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeighFinanceService],
    }).compile();

    service = module.get<NeighFinanceService>(NeighFinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
