import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserSearchService } from './user-search.service';
import { User, UserRole, UserStatus } from '@core/database';
import { CryptoService } from '@core/services';
import { CatalogsService } from 'src/catalogs/services';
import { UserStatusEnum } from '@nexhouse/shared-domain/enums';

describe('UserService password recovery flows', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockCatalogsService: jest.Mocked<CatalogsService>;
  let mockCryptoService: jest.Mocked<CryptoService>;
  let mockSearchService: jest.Mocked<UserSearchService>;
  let recoveryUser: User;

  const currentUser = { id: 1, neighborhoodId: 10 } as User;

  const mockRole = { id: 2, publicId: 'role-uuid' } as UserRole;

  const buildRecoveryUser = () =>
    ({
      id: 100,
      publicId: 'user-public-uuid',
      email: 'test@nexhouse.com',
      neighborhoodId: 10,
      role: mockRole,
      status: { name: UserStatusEnum.ACTIVE },
      recoveryCode: 'ABC-123456',
      recoveryCodeExpiration: new Date(
        Date.now() + 60 * 60 * 1000,
      ).toUTCString(),
      recoveryToken: 'previous-reset-token',
    }) as unknown as User;

  const mockRecoveryStatus = {
    id: 44,
    name: UserStatusEnum.PASSWORD_RECOVERY,
  } as unknown as UserStatus;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        create: jest.fn().mockImplementation((entity, data) => data),
        save: jest.fn().mockImplementation((entity, data) => data),
        findOne: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    } as unknown as jest.Mocked<QueryRunner>;

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as unknown as jest.Mocked<DataSource>;

    mockCatalogsService = {
      findByPublicId: jest.fn(),
      findByName: jest.fn().mockResolvedValue(mockRecoveryStatus),
    } as unknown as jest.Mocked<CatalogsService>;

    mockCryptoService = {
      hash: jest.fn().mockResolvedValue('hashed_pwd'),
    } as unknown as jest.Mocked<CryptoService>;

    mockSearchService = {
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<UserSearchService>;

    recoveryUser = buildRecoveryUser();
    mockUserRepository.findOne.mockResolvedValue(recoveryUser);
    mockSearchService.findByPublicId.mockResolvedValue(recoveryUser);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: CatalogsService, useValue: mockCatalogsService },
        { provide: CryptoService, useValue: mockCryptoService },
        { provide: UserSearchService, useValue: mockSearchService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('update with recovery payloads', () => {
    beforeEach(() => {
      recoveryUser = buildRecoveryUser();
      mockUserRepository.findOne.mockResolvedValue(recoveryUser);
      mockSearchService.findByPublicId.mockResolvedValue(recoveryUser);
      mockCatalogsService.findByName.mockResolvedValue(mockRecoveryStatus);
    });

    it('should throw NotFoundException when the target user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update(10, 'missing-user', { recoveryCode: 'XYZ-654321', recoveryCodeExpiration: '2099-01-01T00:00:00.000Z' }, currentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should store the code, expiration and PASSWORD_RECOVERY status when both are provided', async () => {
      await service.update(
        10,
        'user-public-uuid',
        {
          recoveryCode: 'XYZ-654321',
          recoveryCodeExpiration: new Date(Date.now() + 60 * 60 * 1000).toUTCString(),
        },
        currentUser,
      );

      expect(mockCatalogsService.findByName).toHaveBeenCalledWith(
        UserStatus,
        UserStatusEnum.PASSWORD_RECOVERY,
      );
      expect(recoveryUser.recoveryCode).toBe('XYZ-654321');
      expect(recoveryUser.status).toEqual(mockRecoveryStatus);
    });

    it('should persist a recovery token without wiping the code/expiration stored in step 1', async () => {
      await service.update(
        10,
        'user-public-uuid',
        { recoveryToken: 'new-reset-token' },
        currentUser,
      );

      // The token-only step (validateCode) must keep step-1 data intact.
      expect(recoveryUser.recoveryCode).toBe('ABC-123456');
      expect(recoveryUser.recoveryToken).toBe('new-reset-token');
      expect(recoveryUser.status.name).toBe(UserStatusEnum.ACTIVE);
      expect(mockCatalogsService.findByName).not.toHaveBeenCalled();
    });

    it('should leave recovery fields and status untouched for regular profile updates', async () => {
      await service.update(
        10,
        'user-public-uuid',
        { userRoleId: 'new-role-uuid' },
        currentUser,
      );

      expect(mockCatalogsService.findByName).not.toHaveBeenCalled();
      expect(recoveryUser.status.name).toBe(UserStatusEnum.ACTIVE);
      expect(recoveryUser.recoveryCode).toBe('ABC-123456');
      expect(recoveryUser.recoveryToken).toBe('previous-reset-token');
    });

    it('should throw InternalServerErrorException when a code is provided without an expiration', async () => {
      await expect(
        service.update(10, 'user-public-uuid', { recoveryCode: 'XYZ-654321' }, currentUser),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockCatalogsService.findByName).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when an expiration is provided without a code', async () => {
      await expect(
        service.update(
          10,
          'user-public-uuid',
          { recoveryCodeExpiration: '2099-01-01T00:00:00.000Z' },
          currentUser,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updatePasswordOnRecoveryProcess', () => {
    const mockActiveStatus = { id: 3, name: UserStatusEnum.ACTIVE } as unknown as UserStatus;

    it('should hash the new password, activate the user and clear all recovery data', async () => {
      mockCatalogsService.findByName.mockResolvedValue(mockActiveStatus);
      mockUserRepository.update.mockResolvedValue({ affected: 1 } as never);

      await service.updatePasswordOnRecoveryProcess(100, 'new-secret-pwd');

      expect(mockCryptoService.hash).toHaveBeenCalledWith('new-secret-pwd');
      expect(mockCatalogsService.findByName).toHaveBeenCalledWith(
        UserStatus,
        UserStatusEnum.ACTIVE,
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(100, {
        password: 'hashed_pwd',
        statusId: mockActiveStatus.id,
        recoveryCode: null,
        recoveryCodeExpiration: null,
        recoveryToken: null,
      });
    });
  });
});