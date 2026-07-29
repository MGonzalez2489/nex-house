import { Test, TestingModule } from '@nestjs/testing';
import { NeighUnitsService } from './neigh-units.service';

describe('NeighUnitsService', () => {
  let service: NeighUnitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeighUnitsService],
    }).compile();

    service = module.get<NeighUnitsService>(NeighUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
