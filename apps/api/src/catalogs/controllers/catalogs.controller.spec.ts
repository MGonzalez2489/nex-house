import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from '../services/catalogs.service';
import {
  UserRole,
  UserStatus,
  UserUnitRole,
  UnitStatus,
  UnitType,
  TransactionSource,
  TransactionType,
  PaymentStatus,
  FeeStatus,
  ChargeStatus,
} from '@core/database';
import { BaseCatalog } from '@core/database/entities/_base';
import { TestingModule, Test } from '@nestjs/testing';

describe('CatalogsController', () => {
  let controller: CatalogsController;
  let service: CatalogsService;

  const mockCatalogsService = {
    findAll: jest.fn(() => Promise.resolve([{ id: 1, name: 'Test' }])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogsController],
      providers: [
        {
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
      ],
    }).compile();

    controller = module.get<CatalogsController>(CatalogsController);
    service = module.get<CatalogsService>(CatalogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const testCases: {
    method: keyof CatalogsController;
    entity: new () => BaseCatalog;
  }[] = [
    { method: 'findUserRoles', entity: UserRole },
    { method: 'findUserStatuses', entity: UserStatus },
    { method: 'findUserUnitRoles', entity: UserUnitRole },
    { method: 'findUnitStatuses', entity: UnitStatus },
    { method: 'findUnitType', entity: UnitType },
    { method: 'findTransactionSources', entity: TransactionSource },
    { method: 'findTransactionTypes', entity: TransactionType },
    { method: 'findPaymentStatuses', entity: PaymentStatus },
    { method: 'findFeeStatuses', entity: FeeStatus },
    { method: 'findChargeStatuses', entity: ChargeStatus },
  ];

  testCases.forEach(({ method, entity }) => {
    it(`should call service.findAll with ${entity.name} for ${method}`, async () => {
      await controller[method]();
      expect(service.findAll).toHaveBeenCalledWith(entity);
    });

    it(`should return an array of ${entity.name} for ${method}`, async () => {
      const result = await controller[method]();
      expect(result).toEqual([{ id: 1, name: 'Test' }]);
    });
  });
});
