import { Test, TestingModule } from '@nestjs/testing';
import { FeeScheduleController } from './fee-schedule.controller';

describe('FeeScheduleController', () => {
  let controller: FeeScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeeScheduleController],
    }).compile();

    controller = module.get<FeeScheduleController>(FeeScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
