import { Test, TestingModule } from '@nestjs/testing';
import { NeighborhoodsService } from './neighborhoods.service';

describe('NeighborhoodsService', () => {
  let service: NeighborhoodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeighborhoodsService],
    }).compile();

    service = module.get<NeighborhoodsService>(NeighborhoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
