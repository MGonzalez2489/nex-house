import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DatabaseSeederService } from './seeder.service';
import { CryptoService } from '@core/services';
import {
  ChargeStatusSeed,
  FeeStatusSeed,
  PaymentStatusSeed,
  TransactionSourceSeed,
  TransactionTypeSeed,
  UnitStatusSeed,
  UnitTypeSeed,
  UserRoleSeed,
  UserStatusSeed,
  UserUnitRoleSeed,
} from './seeds';
import { ChihuahuaCitiesSeed, StateSeed } from './seeds/location.seed';
import { City, Country, State, User } from './entities';
import { UserRoleEnum, UserStatusEnum } from '@nexhouse/shared-domain/enums';

describe('DatabaseSeederService', () => {
  let service: DatabaseSeederService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockCountryRepository: jest.Mocked<Repository<Country>>;
  let mockStateRepository: jest.Mocked<Repository<State>>;
  let mockCityRepository: jest.Mocked<Repository<City>>;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let catalogRepository: {
    find: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
  };
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockCryptoService: jest.Mocked<CryptoService>;

  const allCatalogNames = [
    ...ChargeStatusSeed,
    ...FeeStatusSeed,
    ...PaymentStatusSeed,
    ...TransactionSourceSeed,
    ...TransactionTypeSeed,
    ...UnitStatusSeed,
    ...UnitTypeSeed,
    ...UserRoleSeed,
    ...UserStatusSeed,
    ...UserUnitRoleSeed,
  ].map((record) => record.name);

  beforeEach(async () => {
    mockUserRepository = {
      exists: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<Repository<User>>;

    mockCountryRepository = {
      existsBy: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation((data) => data),
    } as unknown as jest.Mocked<Repository<Country>>;

    mockStateRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<Repository<State>>;

    mockCityRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<Repository<City>>;

    catalogRepository = {
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn(),
    };

    mockEntityManager = {
      getRepository: jest.fn().mockReturnValue(catalogRepository),
    } as unknown as jest.Mocked<EntityManager>;

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockCryptoService = {
      hash: jest.fn().mockResolvedValue('hashed_pwd'),
    } as unknown as jest.Mocked<CryptoService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseSeederService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountryRepository,
        },
        { provide: getRepositoryToken(State), useValue: mockStateRepository },
        { provide: getRepositoryToken(City), useValue: mockCityRepository },
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<DatabaseSeederService>(DatabaseSeederService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should seed catalogs first and then location plus super admin', async () => {
      const seedAllCatalogs = jest
        .spyOn(
          service as unknown as { seedAllCatalogs: () => Promise<void> },
          'seedAllCatalogs',
        )
        .mockResolvedValue(undefined);
      const runLocationSeed = jest
        .spyOn(service, 'runLocationSeed')
        .mockResolvedValue(undefined);
      const seedSuperAdmin = jest
        .spyOn(
          service as unknown as { seedSuperAdmin: () => Promise<void> },
          'seedSuperAdmin',
        )
        .mockResolvedValue(undefined);

      await service.onApplicationBootstrap();

      expect(seedAllCatalogs).toHaveBeenCalledTimes(1);
      expect(runLocationSeed).toHaveBeenCalledTimes(1);
      expect(seedSuperAdmin).toHaveBeenCalledTimes(1);
    });
  });

  describe('catalog seeding', () => {
    it('should insert every record when the catalog is empty', async () => {
      catalogRepository.find.mockResolvedValue([]);

      await service['seedAllCatalogs']();

      expect(catalogRepository.save).toHaveBeenCalledTimes(10);
    });

    it('should skip catalogs whose records already exist', async () => {
      catalogRepository.find.mockResolvedValue(
        allCatalogNames.map((name) => ({ name })),
      );

      await service['seedAllCatalogs']();

      expect(catalogRepository.save).not.toHaveBeenCalled();
    });

    it('should insert only the missing records on a partially seeded catalog', async () => {
      catalogRepository.find.mockImplementation((options: { select: unknown }) => {
        // Every catalog reports a single existing record named after the first seed.
        expect(options).toEqual({ select: { name: true } });
        return Promise.resolve([{ name: ChargeStatusSeed[0].name }]);
      });

      await service['seedAllCatalogs']();

      expect(catalogRepository.save).toHaveBeenCalledTimes(10);
      const firstSavedBatch = catalogRepository.save.mock.calls[0][0] as {
        name: string;
      }[];
      expect(firstSavedBatch.map((record) => record.name)).not.toContain(
        ChargeStatusSeed[0].name,
      );
      expect(firstSavedBatch.map((record) => record.name)).toContain(
        ChargeStatusSeed[1].name,
      );
    });

    it('should isolate failures so one catalog cannot block the rest', async () => {
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
      catalogRepository.find.mockRejectedValueOnce(new Error('deadlock'));
      catalogRepository.find.mockResolvedValue([]);

      await expect(service['seedAllCatalogs']()).resolves.not.toThrow();

      expect(catalogRepository.save).toHaveBeenCalledTimes(9);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error seeding catalog'),
        expect.any(String),
      );
    });
  });

  describe('runLocationSeed', () => {
    const stubCountries = () => {
      mockCountryRepository.existsBy.mockResolvedValue(false);
      mockCountryRepository.findOneBy.mockResolvedValue({ id: 1 } as Country);
    };

    it('should seed country, states and cities when the tables are empty', async () => {
      stubCountries();
      mockStateRepository.find.mockResolvedValue([]);
      mockStateRepository.findOneBy.mockResolvedValue({ id: 2 } as State);
      mockCityRepository.find.mockResolvedValue([]);

      await service.runLocationSeed();

      expect(mockCountryRepository.save).toHaveBeenCalledTimes(1);
      expect(mockStateRepository.save).toHaveBeenCalledTimes(1);
      expect(mockStateRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ code: StateSeed[0].code, countryId: 1 }),
        ]),
      );
      expect(mockCityRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should be idempotent when everything already exists', async () => {
      mockCountryRepository.existsBy.mockResolvedValue(true);
      mockCountryRepository.findOneBy.mockResolvedValue({ id: 1 } as Country);
      mockStateRepository.find.mockResolvedValue(
        StateSeed.map((state) => ({ code: state.code })) as State[],
      );
      mockStateRepository.findOneBy.mockResolvedValue({ id: 2 } as State);
      mockCityRepository.find.mockResolvedValue(
        ChihuahuaCitiesSeed.map((city) => ({ name: city.name })) as City[],
      );

      await service.runLocationSeed();

      expect(mockCountryRepository.save).not.toHaveBeenCalled();
      expect(mockStateRepository.save).not.toHaveBeenCalled();
      expect(mockCityRepository.save).not.toHaveBeenCalled();
    });

    it('should abort state seeding when the country is missing', async () => {
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
      mockCountryRepository.existsBy.mockResolvedValue(true);
      mockCountryRepository.findOneBy.mockResolvedValue(null);

      await service.runLocationSeed();

      expect(mockStateRepository.save).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("country 'MX' is missing"),
      );
    });

    it('should abort city seeding when the state is missing', async () => {
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
      stubCountries();
      mockStateRepository.find.mockResolvedValue([]);
      mockStateRepository.findOneBy.mockResolvedValue(null);

      await service.runLocationSeed();

      expect(mockCityRepository.save).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("state 'CHH' is missing"),
      );
    });

    it('should never throw when a repository fails', async () => {
      mockCountryRepository.existsBy.mockResolvedValue(true);
      mockCountryRepository.findOneBy.mockResolvedValue({ id: 1 } as Country);
      mockStateRepository.find.mockRejectedValue(new Error('connection lost'));

      await expect(service.runLocationSeed()).resolves.not.toThrow();
    });
  });

  describe('super admin seeding', () => {
    const stubSuperAdminCatalogs = () => {
      catalogRepository.findOneBy.mockImplementation((criteria: unknown) => {
        const { name } = criteria as { name: string };
        if (name === UserRoleEnum.SUPERADMIN) {
          return Promise.resolve({ id: 1, name });
        }
        if (name === UserStatusEnum.ACTIVE) {
          return Promise.resolve({ id: 2, name });
        }
        return Promise.resolve(null);
      });
    };

    it('should warn and skip when the credentials are not configured', async () => {
      const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn');
      mockConfigService.get.mockReturnValue(undefined);

      await service['seedSuperAdmin']();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skipping super admin seed'),
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should skip when the account already exists', async () => {
      mockConfigService.get
        .mockReturnValueOnce('admin@nexhouse.com')
        .mockReturnValueOnce('secret123');
      mockUserRepository.exists.mockResolvedValue(true);

      await service['seedSuperAdmin']();

      expect(mockUserRepository.exists).toHaveBeenCalledWith({
        where: { email: 'admin@nexhouse.com' },
      });
      expect(mockCryptoService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should normalize the email and resolve role/status by catalog name', async () => {
      mockConfigService.get
        .mockReturnValueOnce('  NewAdmin@Nexhouse.com  ')
        .mockReturnValueOnce('secret123');
      mockUserRepository.exists.mockResolvedValue(false);
      stubSuperAdminCatalogs();

      await service['seedSuperAdmin']();

      expect(mockUserRepository.exists).toHaveBeenCalledWith({
        where: { email: 'newadmin@nexhouse.com' },
      });
      expect(catalogRepository.findOneBy).toHaveBeenCalledWith({
        name: UserRoleEnum.SUPERADMIN,
      });
      expect(catalogRepository.findOneBy).toHaveBeenCalledWith({
        name: UserStatusEnum.ACTIVE,
      });
      expect(mockCryptoService.hash).toHaveBeenCalledWith('secret123');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'newadmin@nexhouse.com',
        password: 'hashed_pwd',
        roleId: 1,
        statusId: 2,
        profile: { firstName: 'Super', lastName: 'Admin' },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should abort when the role or status catalogs are missing', async () => {
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
      mockConfigService.get
        .mockReturnValueOnce('admin@nexhouse.com')
        .mockReturnValueOnce('secret123');
      mockUserRepository.exists.mockResolvedValue(false);
      catalogRepository.findOneBy.mockResolvedValue(null);

      await service['seedSuperAdmin']();

      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('catalog is missing'),
      );
    });

    it('should never throw when hashing or persistence fails', async () => {
      mockConfigService.get
        .mockReturnValueOnce('admin@nexhouse.com')
        .mockReturnValueOnce('secret123');
      mockUserRepository.exists.mockResolvedValue(false);
      stubSuperAdminCatalogs();
      mockCryptoService.hash.mockRejectedValue(new Error('hashing failed'));

      await expect(service['seedSuperAdmin']()).resolves.not.toThrow();
    });
  });
});
