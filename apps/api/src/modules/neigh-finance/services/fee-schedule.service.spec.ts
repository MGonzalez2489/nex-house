import { Test, TestingModule } from '@nestjs/testing';
import { FeeScheduleService } from './fee-schedule.service';

describe('FeeScheduleService', () => {
  let service: FeeScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeeScheduleService],
    }).compile();

    service = module.get<FeeScheduleService>(FeeScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
