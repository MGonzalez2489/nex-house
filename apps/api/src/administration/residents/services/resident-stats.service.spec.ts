import { Test, TestingModule } from '@nestjs/testing';
import { ResidentStatsService } from './resident-stats.service';

describe('ResidentStatsService', () => {
  let service: ResidentStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResidentStatsService],
    }).compile();

    service = module.get<ResidentStatsService>(ResidentStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
