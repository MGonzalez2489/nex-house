import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { DatabaseSeederService } from './seeder.service';
import { CryptoService } from '@core/services';
import { ConfigService } from '@nestjs/config';
import { User } from './entities';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('DatabaseSeederService', () => {
  let service: DatabaseSeederService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockCryptoService: jest.Mocked<CryptoService>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    mockUserRepository = {
      exists: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockCryptoService = {
      hash: jest.fn(),
    } as unknown as jest.Mocked<CryptoService>;

    mockEntityManager = {
      // count: jest.fn(),
      count: jest.fn().mockResolvedValue(10),
      save: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseSeederService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<DatabaseSeederService>(DatabaseSeederService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => null);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should seed catalogs that are completely empty (count === 0)', async () => {
    mockEntityManager.count.mockResolvedValue(0);
    mockEntityManager.save.mockResolvedValue([] as any);

    await service.onApplicationBootstrap();

    expect(mockEntityManager.count).toHaveBeenCalledTimes(10);
    expect(mockEntityManager.save).toHaveBeenCalledTimes(10);
  });

  it('should bypass seeding if catalogs already contain records (count > 0)', async () => {
    mockEntityManager.count.mockResolvedValue(5);

    await service.onApplicationBootstrap();

    expect(mockEntityManager.count).toHaveBeenCalledTimes(10);
    expect(mockEntityManager.save).not.toHaveBeenCalled();
  });

  it('should isolate errors gracefully inside the loop if a catalog seeding execution fails', async () => {
    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

    mockEntityManager.count.mockRejectedValueOnce(
      new Error('Connection timeout deadlock'),
    );
    mockEntityManager.count.mockResolvedValue(5);

    await expect(service.onApplicationBootstrap()).resolves.not.toThrow();

    expect(mockEntityManager.count).toHaveBeenCalledTimes(10);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('🔴 Error seeding catalog'),
      'Connection timeout deadlock',
    );
  });
  //
  describe('seedSuperAdmin', () => {
    it('should exit execution loops early if account records register an active unique match', async () => {
      mockConfigService.get
        .mockReturnValueOnce('admin@nexhouse.com') // SUPER_ADMIN_USER
        .mockReturnValueOnce('secret123'); // SUPER_ADMIN_PWD

      mockUserRepository.exists.mockResolvedValue(true);

      await service['seedSuperAdmin']();

      expect(mockUserRepository.exists).toHaveBeenCalledWith({
        where: { email: 'admin@nexhouse.com' },
      });
      expect(mockCryptoService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should hash passwords and register account credentials if records resolve clean', async () => {
      mockConfigService.get
        .mockReturnValueOnce('NewAdmin@Nexhouse.com') // Raw input with capitals and padding spaces
        .mockReturnValueOnce('secure_password');

      mockUserRepository.exists.mockResolvedValue(false);
      mockCryptoService.hash.mockResolvedValue('encrypted_string_token');
      mockUserRepository.save.mockResolvedValue({} as any);

      await service['seedSuperAdmin']();

      expect(mockUserRepository.exists).toHaveBeenCalledWith({
        where: { email: 'newadmin@nexhouse.com' },
      });
      expect(mockCryptoService.hash).toHaveBeenCalledWith('secure_password');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'newadmin@nexhouse.com',
        password: 'encrypted_string_token',
        firstName: 'Super',
        lastName: 'Admin',
        roleId: 1,
        statusId: 1,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});
