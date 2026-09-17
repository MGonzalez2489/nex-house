import {
  NeighStreet,
  Unit,
  UnitType,
  UnitStatus,
  User,
  UserRole,
  UserStatus,
  UserUnit,
  UserUnitRole,
} from '@core/database';
import { CryptoService } from '@core/services';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CatalogsService } from 'src/catalogs/services';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { CreateResidentDto, UpdateUserDto } from '../dtos';
import { ResidentSearchService } from './resident-search.service';
import { ResidentService } from './resident.service';

describe('ResidentService', () => {
  let service: ResidentService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockManager: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    softRemove: jest.Mock;
  };
  let mockCatalogsService: jest.Mocked<CatalogsService>;
  let mockCryptoService: jest.Mocked<CryptoService>;
  let mockSearchService: jest.Mocked<ResidentSearchService>;

  const currentUser = { id: 1, neighborhoodId: 10 } as User;
  const mockDto: CreateResidentDto = {
    email: 'test@nexhouse.com',
    userRoleId: 'role-uuid',
    unit: {
      unitId: 'unit-uuid',
      unitRoleId: 'user-unit-role-uuid',
      isCurrentOccupant: true,
    },
  };
  const mockUpdateDto: UpdateUserDto = {
    userRoleId: 'new-role-uuid',
    unit: {
      unitId: 'new-unit-uuid',
      unitRoleId: 'user-unit-role-uuid',
      isCurrentOccupant: true,
    },
  };

  const mockRole = { id: 2, publicId: 'role-uuid', name: 'RESIDENT' } as UserRole;
  const mockNewRole = { id: 22, publicId: 'new-role-uuid', name: 'ADMIN' } as UserRole;
  const mockStatus = { id: 3, name: 'PENDING_ONBOARDING' } as UserStatus;
  const mockUserUnitRole = {
    id: 4,
    publicId: 'user-unit-role-uuid',
    name: 'OCCUPANT',
  } as UserUnitRole;
  const mockUnit = { id: 5, publicId: 'unit-uuid' } as Unit;
  const mockNewUnit = { id: 55, publicId: 'new-unit-uuid' } as Unit;
  const mockStreet = { id: 6, publicId: 'street-uuid', neighborhoodId: 10 } as NeighStreet;
  const mockUnitType = { id: 7, publicId: 'unit-type-uuid' } as UnitType;
  const mockUnitStatus = { id: 8, name: 'OCCUPIED' } as UnitStatus;

  const mockSavedUser = {
    id: 100,
    publicId: 'user-public-uuid',
    email: 'test@nexhouse.com',
    neighborhoodId: 10,
    role: mockRole,
    status: mockStatus,
    userUnits: [],
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUserRepository = {
      exists: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    mockManager = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      softRemove: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: mockManager as unknown as EntityManager,
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
    } as unknown as jest.Mocked<ResidentSearchService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResidentService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: CatalogsService, useValue: mockCatalogsService },
        { provide: CryptoService, useValue: mockCryptoService },
        { provide: ResidentSearchService, useValue: mockSearchService },
      ],
    }).compile();

    service = module.get<ResidentService>(ResidentService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws ForbiddenException when the neighborhood scope does not match the actor', async () => {
      await expect(service.create(99, mockDto, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ConflictException when the email is already registered', async () => {
      mockUserRepository.exists.mockResolvedValueOnce(true);

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws BadRequestException when the role catalog is missing', async () => {
      mockUserRepository.exists.mockResolvedValueOnce(false);
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(null);

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.connect).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the pending-onboarding status catalog is missing', async () => {
      mockUserRepository.exists.mockResolvedValueOnce(false);
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(mockRole);
      mockCatalogsService.findByName.mockResolvedValueOnce(null);

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.connect).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the unit role catalog is missing', async () => {
      mockUserRepository.exists.mockResolvedValueOnce(false);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockRole) // user role
        .mockResolvedValueOnce(null); // unit role
      mockCatalogsService.findByName.mockResolvedValueOnce(mockStatus);

      mockManager.save.mockResolvedValueOnce(mockSavedUser);

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('creates the resident and assigns an existing unit within a transaction', async () => {
      mockUserRepository.exists.mockResolvedValueOnce(false);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockRole) // user role
        .mockResolvedValueOnce(mockUserUnitRole); // unit role
      mockCatalogsService.findByName.mockResolvedValueOnce(mockStatus);

      mockManager.create.mockImplementation((entity, data) => data);
      mockManager.save
        .mockResolvedValueOnce(mockSavedUser) // user
        .mockResolvedValueOnce({ id: 200 }); // user_unit assignment
      mockManager.findOne.mockResolvedValueOnce(mockUnit); // existing unit
      mockSearchService.findByPublicId.mockResolvedValueOnce(mockSavedUser);

      const result = await service.create(10, mockDto, currentUser);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledWith(
        User,
        expect.objectContaining({
          email: 'test@nexhouse.com',
          role: mockRole,
          status: mockStatus,
          neighborhoodId: 10,
        }),
      );
      expect(mockManager.create).toHaveBeenCalledWith(
        UserUnit,
        expect.objectContaining({
          unitId: mockUnit.id,
          userId: mockSavedUser.id,
          userUnitRole: mockUserUnitRole,
          isCurrentOccupant: true,
        }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockSavedUser);
    });

    it('creates a new unit when the DTO does not reference an existing one', async () => {
      const dtoWithNewUnit: CreateResidentDto = {
        ...mockDto,
        unit: {
          streetId: 'street-uuid',
          unitTypeId: 'unit-type-uuid',
          unitIdentifier: 'A-101',
          unitRoleId: 'user-unit-role-uuid',
          isCurrentOccupant: true,
        },
      };

      mockUserRepository.exists.mockResolvedValueOnce(false);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(mockUserUnitRole);
      mockCatalogsService.findByName.mockResolvedValueOnce(mockStatus);

      mockManager.create.mockImplementation((entity, data) => data);
      mockManager.save
        .mockResolvedValueOnce(mockSavedUser) // user
        .mockResolvedValueOnce(mockUnit) // new unit
        .mockResolvedValueOnce({ id: 200 }); // assignment
      mockManager.findOne
        .mockResolvedValueOnce(mockStreet) // street lookup
        .mockResolvedValueOnce(mockUnitType) // unit type lookup
        .mockResolvedValueOnce(null) // no existing unit
        .mockResolvedValueOnce(mockUnitStatus); // occupied status lookup
      mockSearchService.findByPublicId.mockResolvedValueOnce(mockSavedUser);

      await service.create(10, dtoWithNewUnit, currentUser);

      expect(mockManager.create).toHaveBeenCalledWith(
        Unit,
        expect.objectContaining({
          streetId: mockStreet.id,
          identifier: 'A-101',
          neighborhoodId: 10,
          statusId: mockUnitStatus.id,
          createdBy: currentUser.id,
        }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('rolls back and throws InternalServerErrorException on a generic failure', async () => {
      mockUserRepository.exists.mockResolvedValueOnce(false);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(mockUserUnitRole);
      mockCatalogsService.findByName.mockResolvedValueOnce(mockStatus);
      mockManager.findOne.mockResolvedValueOnce(mockUnit);

      mockManager.save.mockRejectedValueOnce(
        new Error('DB connection lost'),
      );

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const freshUpdateUser = () =>
      ({
        ...mockSavedUser,
        role: mockRole,
        userUnits: [
          { id: 50, unit: mockUnit, userUnitRole: mockUserUnitRole, isCurrentOccupant: true },
        ],
      }) as User;

    it('throws NotFoundException when the user is not found in the neighborhood', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update(10, 'invalid-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when the new role catalog is missing', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(freshUpdateUser());
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(null);

      await expect(
        service.update(10, 'user-public-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.connect).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the unit role catalog is missing', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(freshUpdateUser());
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockNewRole) // user role
        .mockResolvedValueOnce(null); // unit role
      mockManager.findOne.mockResolvedValueOnce(mockUnit);

      await expect(
        service.update(10, 'user-public-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('updates the role and reassigns the unit within a transaction', async () => {
      const user = freshUpdateUser();
      mockUserRepository.findOne.mockResolvedValueOnce(user);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockNewRole) // user role
        .mockResolvedValueOnce(mockUserUnitRole); // unit role
      mockManager.findOne.mockResolvedValueOnce(mockNewUnit);
      mockManager.create.mockImplementation((entity, data) => data);
      mockManager.save
        .mockImplementation(async (entity, data) => data);
      mockSearchService.findByPublicId.mockResolvedValueOnce({
        ...user,
        role: mockNewRole,
      } as User);

      const result = await service.update(
        10,
        'user-public-uuid',
        mockUpdateDto,
        currentUser,
      );

      expect(mockManager.create).toHaveBeenCalledWith(
        UserUnit,
        expect.objectContaining({
          unitId: mockNewUnit.id,
          userId: user.id,
          userUnitRole: mockUserUnitRole,
        }),
      );
      expect(mockManager.save).toHaveBeenCalledWith(
        User,
        user,
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.role).toEqual(mockNewRole);
    });

    it('is a no-op when the unit assignment has not changed', async () => {
      const user = freshUpdateUser();
      const unchangedDto: UpdateUserDto = {
        unit: {
          unitId: 'unit-uuid',
          unitRoleId: 'user-unit-role-uuid',
          isCurrentOccupant: true,
        },
      };
      mockUserRepository.findOne.mockResolvedValueOnce(user);
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(
        mockUserUnitRole,
      );
      mockManager.findOne.mockResolvedValueOnce(mockUnit);
      mockManager.create.mockImplementation((entity, data) => data);
      mockManager.save
        .mockImplementation(async (entity, data) => data);
      mockSearchService.findByPublicId.mockResolvedValueOnce(user);

      await service.update(10, 'user-public-uuid', unchangedDto, currentUser);

      expect(mockManager.create).not.toHaveBeenCalledWith(
        UserUnit,
        expect.anything(),
      );
      expect(mockManager.softRemove).not.toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(User, user);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('rolls back and throws InternalServerErrorException on a generic failure', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(freshUpdateUser());
      mockManager.findOne.mockResolvedValueOnce(mockUnit);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockNewRole)
        .mockResolvedValueOnce(mockUserUnitRole);

      mockManager.create.mockImplementation((entity, data) => data);
      mockManager.save.mockRejectedValueOnce(
        new Error('Transaction Failed'),
      );

      await expect(
        service.update(10, 'user-public-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('returns false when the user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.changePassword('uuid', 'old', 'new');

      expect(result).toBe(false);
    });

    it('returns false when old and new passwords match', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({} as User);

      const result = await service.changePassword('uuid', 'same', 'same');

      expect(result).toBe(false);
    });

    it('returns false when the old password mismatch is detected', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({
        password: 'hashed',
      } as User);
      mockCryptoService.compare.mockResolvedValueOnce(false);

      const result = await service.changePassword('uuid', 'wrong', 'new');

      expect(result).toBe(false);
    });

    it('hashes and persists the new password on success', async () => {
      const user = {
        password: 'old-hash',
        requirePwdChange: true,
      } as User;
      mockUserRepository.findOne.mockResolvedValue(user);
      mockCryptoService.compare.mockResolvedValue(true);
      mockCryptoService.hash.mockResolvedValue('new-hash');
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.changePassword('uuid', 'old', 'new-pass');

      expect(mockCryptoService.hash).toHaveBeenCalledWith('new-pass');
      expect(user.password).toBe('new-hash');
      expect(user.requirePwdChange).toBe(false);
      expect(result).toBe(true);
    });
  });

  describe('restorePwd', () => {
    it('throws NotFoundException when the user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.restorePwd(99)).rejects.toThrow(NotFoundException);
    });

    it('hashes the default password and persists it', async () => {
      const user = { id: 5, password: 'old' } as User;
      mockUserRepository.findOne.mockResolvedValueOnce(user);
      mockCryptoService.hash.mockResolvedValueOnce('1234-hash');
      mockUserRepository.save.mockResolvedValueOnce(user);

      await service.restorePwd(5);

      expect(mockCryptoService.hash).toHaveBeenCalled();
      expect(user.password).toBe('1234-hash');
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('updateAvatar', () => {
    it('throws NotFoundException when the resident does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateAvatar(99, {} as Express.Multer.File),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns the resident profile when found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockSavedUser);
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockSavedUser)
        .mockResolvedValueOnce(mockSavedUser);
      const file = { filename: 'avatar.png' } as Express.Multer.File;

      const result = await service.updateAvatar(100, file);

      expect(result).toEqual(mockSavedUser);
    });
  });
});