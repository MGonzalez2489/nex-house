import { Test, TestingModule } from '@nestjs/testing';
import { HousingUnitsService } from './housing-units.service';

describe('HousingUnitsService', () => {
  let service: HousingUnitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HousingUnitsService],
    }).compile();

    service = module.get<HousingUnitsService>(HousingUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
