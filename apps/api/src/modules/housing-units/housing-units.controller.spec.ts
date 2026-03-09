import { Test, TestingModule } from '@nestjs/testing';
import { HousingUnitsController } from './housing-units.controller';
import { HousingUnitsService } from './housing-units.service';

describe('HousingUnitsController', () => {
  let controller: HousingUnitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HousingUnitsController],
      providers: [HousingUnitsService],
    }).compile();

    controller = module.get<HousingUnitsController>(HousingUnitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
