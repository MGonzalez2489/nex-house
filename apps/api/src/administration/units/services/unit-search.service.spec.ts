import { Test, TestingModule } from '@nestjs/testing';
import { UnitSearchService } from './unit-search.service';

describe('UnitSearchService', () => {
  let service: UnitSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitSearchService],
    }).compile();

    service = module.get<UnitSearchService>(UnitSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
