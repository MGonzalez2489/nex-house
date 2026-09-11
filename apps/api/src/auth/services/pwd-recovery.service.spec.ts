import { Test, TestingModule } from '@nestjs/testing';
import { PwdRecoveryService } from './pwd-recovery.service';

describe('PwdRecoveryService', () => {
  let service: PwdRecoveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PwdRecoveryService],
    }).compile();

    service = module.get<PwdRecoveryService>(PwdRecoveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
