import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from '../services/catalogs.service';
import {
  ChargeStatus,
  City,
  Country,
  FeeStatus,
  PaymentStatus,
  State,
  TransactionSource,
  TransactionType,
  UnitStatus,
  UnitType,
  UserRole,
  UserStatus,
  UserUnitRole,
} from '@core/database';
import { BaseCatalog } from '@core/database/entities/_base';
import { TestingModule, Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { NotFoundException } from '@nestjs/common';
import { Not } from 'typeorm';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';

type PlainCatalogMethod =
  | 'findUserStatuses'
  | 'findUserUnitRoles'
  | 'findUnitStatuses'
  | 'findUnitTypes'
  | 'findTransactionSources'
  | 'findTransactionTypes'
  | 'findPaymentStatuses'
  | 'findFeeStatuses'
  | 'findChargeStatuses';

describe('CatalogsController', () => {
  let controller: CatalogsController;

  const mockCatalogsService = {
    findAll: jest.fn(),
    findByPublicId: jest.fn(),
  };

  const catalogRecord = {
    id: 1,
    publicId: 'uuid-1',
    name: 'ACTIVE',
    displayName: 'Active',
  } as unknown as BaseCatalog;

  const countryRecord = {
    id: 10,
    publicId: 'country-uuid',
    name: 'Mexico',
    displayName: 'Mexico',
    code: 'MX',
  } as unknown as Country;

  const stateRecord = {
    id: 20,
    publicId: 'state-uuid',
    name: 'Chihuahua',
    displayName: 'Chihuahua',
    code: 'CHH',
    countryId: 10,
  } as unknown as State;

  const cityRecord = {
    id: 30,
    publicId: 'city-uuid',
    name: 'Juarez',
    displayName: 'Juarez',
    stateId: 20,
  } as unknown as City;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogsController],
      providers: [
        {
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get<CatalogsController>(CatalogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findUserRoles', () => {
    it('should exclude SUPERADMIN from the user roles catalog', async () => {
      mockCatalogsService.findAll.mockResolvedValue([catalogRecord]);

      const result = await controller.findUserRoles();

      expect(mockCatalogsService.findAll).toHaveBeenCalledWith(UserRole, {
        where: { name: Not(UserRoleEnum.SUPERADMIN) },
      });
      expect(result).toEqual([catalogRecord]);
    });
  });

  const plainCatalogCases: Array<[PlainCatalogMethod, new () => BaseCatalog]> =
    [
      ['findUserStatuses', UserStatus],
      ['findUserUnitRoles', UserUnitRole],
      ['findUnitStatuses', UnitStatus],
      ['findUnitTypes', UnitType],
      ['findTransactionSources', TransactionSource],
      ['findTransactionTypes', TransactionType],
      ['findPaymentStatuses', PaymentStatus],
      ['findFeeStatuses', FeeStatus],
      ['findChargeStatuses', ChargeStatus],
    ];

  describe.each(plainCatalogCases)('%s', (method, entity) => {
    it(`should query ${entity.name} without options and return the records`, async () => {
      mockCatalogsService.findAll.mockResolvedValue([catalogRecord]);

      const result = await controller[method]();

      expect(mockCatalogsService.findAll).toHaveBeenCalledWith(entity);
      expect(result).toEqual([catalogRecord]);
    });
  });

  describe('findCountries', () => {
    it('should query the Country entity and return the records', async () => {
      mockCatalogsService.findAll.mockResolvedValue([countryRecord]);

      const result = await controller.findCountries();

      expect(mockCatalogsService.findAll).toHaveBeenCalledWith(Country);
      expect(result).toEqual([countryRecord]);
    });
  });

  describe('findStatesByCountryId', () => {
    it('should resolve the country by public ID and filter its states', async () => {
      mockCatalogsService.findByPublicId.mockResolvedValue(countryRecord);
      mockCatalogsService.findAll.mockResolvedValue([stateRecord]);

      const result = await controller.findStatesByCountryId('country-uuid');

      expect(mockCatalogsService.findByPublicId).toHaveBeenCalledWith(
        Country,
        'country-uuid',
      );
      expect(mockCatalogsService.findAll).toHaveBeenCalledWith(State, {
        where: { countryId: countryRecord.id },
      });
      expect(result).toEqual([stateRecord]);
    });

    it('should propagate the NotFoundException and skip the states query when the country is missing', async () => {
      mockCatalogsService.findByPublicId.mockRejectedValue(
        new NotFoundException('Country not found'),
      );

      await expect(
        controller.findStatesByCountryId('missing-uuid'),
      ).rejects.toThrow(NotFoundException);
      expect(mockCatalogsService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findCitiesByStateId', () => {
    it('should resolve the state by public ID and filter its cities', async () => {
      mockCatalogsService.findByPublicId.mockResolvedValue(stateRecord);
      mockCatalogsService.findAll.mockResolvedValue([cityRecord]);

      const result = await controller.findCitiesByStateId('state-uuid');

      expect(mockCatalogsService.findByPublicId).toHaveBeenCalledWith(
        State,
        'state-uuid',
      );
      expect(mockCatalogsService.findAll).toHaveBeenCalledWith(City, {
        where: { stateId: stateRecord.id },
      });
      expect(result).toEqual([cityRecord]);
    });

    it('should propagate the NotFoundException and skip the cities query when the state is missing', async () => {
      mockCatalogsService.findByPublicId.mockRejectedValue(
        new NotFoundException('State not found'),
      );

      await expect(
        controller.findCitiesByStateId('missing-uuid'),
      ).rejects.toThrow(NotFoundException);
      expect(mockCatalogsService.findAll).not.toHaveBeenCalled();
    });
  });
});
