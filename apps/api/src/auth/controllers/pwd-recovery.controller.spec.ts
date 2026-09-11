import { Test, TestingModule } from '@nestjs/testing';
import { PwdRecoveryController } from './pwd-recovery.controller';

describe('PwdRecoveryController', () => {
  let controller: PwdRecoveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PwdRecoveryController],
    }).compile();

    controller = module.get<PwdRecoveryController>(PwdRecoveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
