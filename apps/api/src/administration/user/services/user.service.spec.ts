import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserSearchService } from './user-search.service';
import {
  NeighStreet,
  Unit,
  UnitStatus,
  UnitType,
  User,
  UserRole,
  UserStatus,
  UserUnit,
  UserUnitRole,
} from '@core/database';
import { CryptoService } from '@core/services';
import { CatalogsService } from 'src/catalogs/services';
import { UnitStatusEnum, UserStatusEnum } from '@nexhouse/shared-domain/enums';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockCatalogsService: jest.Mocked<CatalogsService>;
  let mockCryptoService: jest.Mocked<CryptoService>;
  let mockSearchService: jest.Mocked<UserSearchService>;

  const currentUser = { id: 1, neighborhoodId: 10 } as User;

  const mockRole = { id: 2, publicId: 'role-uuid' } as UserRole;
  const mockNewRole = { id: 22, publicId: 'new-role-uuid' } as UserRole;
  const mockRecoveryStatus = {
    id: 33,
    name: UserStatusEnum.PASSWORD_RECOVERY,
  } as unknown as UserStatus;
  const mockActiveStatus = {
    id: 3,
    name: UserStatusEnum.ACTIVE,
  } as unknown as UserStatus;
  const mockUserUnitRole = {
    id: 4,
    publicId: 'user-unit-role-uuid',
  } as UserUnitRole;
  const mockUnit = { id: 5, publicId: 'unit-uuid' } as Unit;
  const mockUnitType = { id: 7, publicId: 'type-uuid' } as UnitType;
  const mockUnitStatus = {
    id: 8,
    name: UnitStatusEnum.OCCUPIED,
  } as unknown as UnitStatus;
  const mockStreet = { id: 6, publicId: 'street-uuid' } as NeighStreet;

  const buildUser = () =>
    ({
      id: 100,
      publicId: 'user-public-uuid',
      email: 'user@nexhouse.com',
      neighborhoodId: 10,
      role: mockRole,
      status: mockActiveStatus,
    }) as unknown as User;

  let existingUser: User;
  let savedUser: User;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        create: jest.fn().mockImplementation((_entity, data) => data),
        save: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    } as unknown as jest.Mocked<QueryRunner>;

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as unknown as jest.Mocked<DataSource>;

    mockCatalogsService = {
      findByPublicId: jest.fn(),
      findByName: jest.fn(),
    } as unknown as jest.Mocked<CatalogsService>;

    mockCryptoService = {
      hash: jest.fn().mockResolvedValue('hashed_pwd'),
      compare: jest.fn(),
    } as unknown as jest.Mocked<CryptoService>;

    mockSearchService = {
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<UserSearchService>;

    existingUser = buildUser();
    savedUser = buildUser();
    mockUserRepository.findOne.mockResolvedValue(existingUser);
    mockSearchService.findByPublicId.mockResolvedValue(savedUser);

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should throw NotFoundException when the user is outside the neighborhood scope', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update(10, 'missing-user', {}, currentUser),
      ).rejects.toThrow(NotFoundException);

      expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('should resolve and persist a new role when it differs from the current one', async () => {
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(mockNewRole);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValueOnce(
        savedUser,
      );

      const result = await service.update(
        10,
        'user-public-uuid',
        { userRoleId: 'new-role-uuid' },
        currentUser,
      );

      expect(mockCatalogsService.findByPublicId).toHaveBeenCalledWith(
        UserRole,
        'new-role-uuid',
      );
      expect(existingUser.role).toBe(mockNewRole);
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        User,
        existingUser,
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });

    it('should not resolve a role when the payload repeats the current one', async () => {
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValueOnce(
        savedUser,
      );

      await service.update(
        10,
        'user-public-uuid',
        { userRoleId: 'role-uuid' },
        currentUser,
      );

      expect(mockCatalogsService.findByPublicId).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when a recovery code has no expiration', async () => {
      await expect(
        service.update(
          10,
          'user-public-uuid',
          { recoveryCode: 'ABC-123456' },
          currentUser,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockCatalogsService.findByName).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when an expiration has no recovery code', async () => {
      await expect(
        service.update(
          10,
          'user-public-uuid',
          { recoveryCodeExpiration: '2099-01-01T00:00:00.000Z' },
          currentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should store the recovery code, expiration and PASSWORD_RECOVERY status', async () => {
      mockCatalogsService.findByName.mockResolvedValueOnce(mockRecoveryStatus);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValueOnce(
        savedUser,
      );

      await service.update(
        10,
        'user-public-uuid',
        {
          recoveryCode: 'XYZ-654321',
          recoveryCodeExpiration: '2099-01-01T00:00:00.000Z',
        },
        currentUser,
      );

      expect(mockCatalogsService.findByName).toHaveBeenCalledWith(
        UserStatus,
        UserStatusEnum.PASSWORD_RECOVERY,
      );
      expect(existingUser.recoveryCode).toBe('XYZ-654321');
      expect(existingUser.recoveryCodeExpiration).toBe(
        '2099-01-01T00:00:00.000Z',
      );
      expect(existingUser.status).toBe(mockRecoveryStatus);
    });

    it('should store only the recovery token, keeping step 1 data intact', async () => {
      existingUser.recoveryCode = 'ABC-123456';

      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValueOnce(
        savedUser,
      );

      await service.update(
        10,
        'user-public-uuid',
        { recoveryToken: 'new-reset-token' },
        currentUser,
      );

      expect(mockCatalogsService.findByName).not.toHaveBeenCalled();
      expect(existingUser.recoveryCode).toBe('ABC-123456');
      expect(existingUser.recoveryToken).toBe('new-reset-token');
    });

    it('should assign an existing unit scoped to the neighborhood and deactivate the previous occupant', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockUnit,
      );
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(mockUserUnitRole);
      (mockQueryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(savedUser)
        .mockResolvedValueOnce({});

      await service.update(
        10,
        'user-public-uuid',
        {
          unit: {
            unitId: 'unit-uuid',
            unitRoleId: 'user-unit-role-uuid',
            isCurrentOccupant: true,
          },
        },
        currentUser,
      );

      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(Unit, {
        where: { publicId: 'unit-uuid', neighborhoodId: 10 },
      });
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        UserUnit,
        { userId: savedUser.id, isCurrentOccupant: true },
        { isCurrentOccupant: false },
      );
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(
        UserUnit,
        expect.objectContaining({
          unitId: mockUnit.id,
          userId: savedUser.id,
          userUnitRole: mockUserUnitRole,
        }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should create a new unit with type and status when an identifier is provided', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockStreet,
      );
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockUnitType)
        .mockResolvedValueOnce(mockUserUnitRole);
      mockCatalogsService.findByName.mockResolvedValueOnce(mockUnitStatus);
      (mockQueryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(savedUser)
        .mockResolvedValueOnce(mockUnit)
        .mockResolvedValueOnce({});

      await service.update(
        10,
        'user-public-uuid',
        {
          unit: {
            unitIdentifier: 'a-101',
            streetId: 'street-uuid',
            unitTypeId: 'type-uuid',
            unitRoleId: 'user-unit-role-uuid',
            isCurrentOccupant: true,
          },
        },
        currentUser,
      );

      expect(mockCatalogsService.findByPublicId).toHaveBeenCalledWith(
        UnitType,
        'type-uuid',
      );
      expect(mockCatalogsService.findByName).toHaveBeenCalledWith(
        UnitStatus,
        UnitStatusEnum.OCCUPIED,
      );
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(Unit, {
        streetId: mockStreet.id,
        identifier: 'A-101',
        neighborhoodId: 10,
        typeId: mockUnitType.id,
        statusId: mockUnitStatus.id,
        createdBy: currentUser.id,
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when the referenced unit is not in the neighborhood', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.update(
          10,
          'user-public-uuid',
          {
            unit: {
              unitId: 'foreign-unit',
              unitRoleId: 'user-unit-role-uuid',
              isCurrentOccupant: true,
            },
          },
          currentUser,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when the referenced street is not in the neighborhood', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.update(
          10,
          'user-public-uuid',
          {
            unit: {
              unitIdentifier: 'A-101',
              streetId: 'foreign-street',
              unitTypeId: 'type-uuid',
              unitRoleId: 'user-unit-role-uuid',
              isCurrentOccupant: true,
            },
          },
          currentUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when creating a unit without a type', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockStreet,
      );

      await expect(
        service.update(
          10,
          'user-public-uuid',
          {
            unit: {
              unitIdentifier: 'A-101',
              streetId: 'street-uuid',
              unitRoleId: 'user-unit-role-uuid',
              isCurrentOccupant: true,
            },
          },
          currentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rethrow NotFoundException raised by catalog lookups instead of wrapping it', async () => {
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockUnit,
      );
      mockCatalogsService.findByPublicId.mockRejectedValueOnce(
        new NotFoundException('User unit role not found'),
      );
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValueOnce(
        savedUser,
      );

      await expect(
        service.update(
          10,
          'user-public-uuid',
          {
            unit: {
              unitId: 'unit-uuid',
              unitRoleId: 'missing-role',
              isCurrentOccupant: true,
            },
          },
          currentUser,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should rethrow ConflictException raised inside the transaction', async () => {
      (mockQueryRunner.manager.save as jest.Mock).mockRejectedValueOnce(
        new ConflictException('duplicated assignment'),
      );

      await expect(
        service.update(10, 'user-public-uuid', {}, currentUser),
      ).rejects.toThrow(ConflictException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback and throw InternalServerErrorException on database failure', async () => {
      (mockQueryRunner.manager.save as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection lost'),
      );

      await expect(
        service.update(10, 'user-public-uuid', {}, currentUser),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should return false when the user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.changePassword('missing', 'old', 'new'),
      ).resolves.toBe(false);
    });

    it('should return false when the new password equals the old one', async () => {
      await expect(
        service.changePassword('user-public-uuid', 'same', 'same'),
      ).resolves.toBe(false);

      expect(mockCryptoService.compare).not.toHaveBeenCalled();
    });

    it('should return false when the old password does not match', async () => {
      mockCryptoService.compare.mockResolvedValueOnce(false);

      await expect(
        service.changePassword('user-public-uuid', 'wrong', 'new'),
      ).resolves.toBe(false);

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should hash the new password, clear requirePwdChange and return true', async () => {
      mockCryptoService.compare.mockResolvedValueOnce(true);

      await expect(
        service.changePassword('user-public-uuid', 'old', 'new'),
      ).resolves.toBe(true);

      expect(mockCryptoService.hash).toHaveBeenCalledWith('new');
      expect(existingUser.password).toBe('hashed_pwd');
      expect(existingUser.requirePwdChange).toBe(false);
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
    });
  });

  describe('updatePasswordOnRecoveryProcess', () => {
    it('should hash the password, activate the user and clear recovery data', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 } as never);
      mockCatalogsService.findByName.mockResolvedValueOnce(mockActiveStatus);

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

  describe('cleanPwdRecoveryState', () => {
    it('should restore the active status and clear recovery data', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 } as never);
      mockCatalogsService.findByName.mockResolvedValueOnce(mockActiveStatus);

      await service.cleanPwdRecoveryState(100);

      expect(mockUserRepository.update).toHaveBeenCalledWith(100, {
        statusId: mockActiveStatus.id,
        recoveryCode: null,
        recoveryCodeExpiration: null,
        recoveryToken: null,
      });
    });
  });
});
