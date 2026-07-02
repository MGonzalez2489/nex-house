import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import {
  ForbiddenException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserSearchService } from './user-search.service';
import {
  User,
  UserRole,
  UserStatus,
  UserUnitRole,
  Unit,
  NeighStreet,
  UserUnit,
} from '@core/database';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { CryptoService } from '@core/services';
import { CatalogsService } from 'src/catalogs/services';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockCatalogsService: jest.Mocked<CatalogsService>;
  let mockCryptoService: jest.Mocked<CryptoService>;
  let mockSearchService: jest.Mocked<UserSearchService>;

  const currentUser = { id: 1, neighborhoodId: 10 } as User;
  const mockDto: CreateUserDto = {
    email: 'test@nexhouse.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    roleId: 'role-uuid',
    assignUnits: {
      unitId: 'unit-uuid',
      userUnitRoleId: 'user-unit-role-uuid',
      isOccupant: true,
    },
  };
  const mockUpdateDto: UpdateUserDto = {
    firstName: 'John Updated',
    email: 'updated@nexhouse.com',
    phone: '0987654321',
    roleId: 'new-role-uuid',
    assignUnits: {
      unitId: 'new-unit-uuid',
      userUnitRoleId: 'user-unit-role-uuid',
      isOccupant: true,
    },
  };

  const mockRole = { id: 2, publicId: 'role-uuid' } as UserRole;
  const mockNewRole = { id: 22, publicId: 'new-role-uuid' } as UserRole;
  const mockStatus = { id: 3, name: 'pending' } as UserStatus;
  const mockUserUnitRole = {
    id: 4,
    publicId: 'user-unit-role-uuid',
  } as UserUnitRole;
  const mockUnit = { id: 5, publicId: 'unit-uuid' } as Unit;
  const mockNewUnit = { id: 55, publicId: 'new-unit-uuid' } as Unit;
  const mockStreet = { id: 6, publicId: 'street-uuid' } as NeighStreet;
  const mockSavedUser = {
    id: 100,
    publicId: 'user-public-uuid',
    email: 'test@nexhouse.com',
    phone: '1234567890',
    role: mockRole,
  } as User;

  //
  beforeEach(async () => {
    mockUserRepository = {
      exists: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        create: jest.fn().mockImplementation((entity, data) => data),
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
    } as unknown as jest.Mocked<CryptoService>;

    mockSearchService = {
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<UserSearchService>;

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

  describe('create', () => {
    it('should throw ForbiddenException if neighborhood scope is invalid', async () => {
      await expect(service.create(99, mockDto, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockUserRepository.exists.mockResolvedValueOnce(true);

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if phone is already registered', async () => {
      mockUserRepository.exists
        .mockResolvedValueOnce(false) // email check
        .mockResolvedValueOnce(true); // phone check

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if target user role catalog is missing', async () => {
      mockUserRepository.exists.mockResolvedValue(false);
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(null);

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create user and associate to an existing unit within a transaction', async () => {
      mockUserRepository.exists.mockResolvedValue(false);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(mockUserUnitRole);
      mockCatalogsService.findByName.mockResolvedValueOnce(mockStatus);

      (mockQueryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(mockSavedUser) // user
        .mockResolvedValueOnce({}); // userUnit assignment

      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockUnit,
      ); // existing unit
      mockSearchService.findByPublicId.mockResolvedValueOnce(mockSavedUser);

      const result = await service.create(10, mockDto, currentUser);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(
        User,
        expect.any(Object),
      );
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(
        UserUnit,
        expect.any(Object),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockSavedUser);
    });

    it('should create user and instantiate a new unit when unitId is absent', async () => {
      const dtoWithNewUnit: CreateUserDto = {
        ...mockDto,
        assignUnits: {
          unitIdentifier: 'A-101',
          streetId: 'street-uuid',
          userUnitRoleId: 'user-unit-role-uuid',
          isOccupant: true,
        },
      };

      mockUserRepository.exists.mockResolvedValue(false);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(mockUserUnitRole);
      mockCatalogsService.findByName.mockResolvedValueOnce(mockStatus);

      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockStreet,
      );
      (mockQueryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(mockSavedUser) // user
        .mockResolvedValueOnce(mockUnit) // new unit
        .mockResolvedValueOnce({}); // assignment

      mockSearchService.findByPublicId.mockResolvedValueOnce(mockSavedUser);

      await service.create(10, dtoWithNewUnit, currentUser);

      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(Unit, {
        streetId: mockStreet.id,
        identifier: 'A-101',
        neighborhoodId: 10,
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction and throw InternalServerErrorException on generic failure', async () => {
      mockUserRepository.exists.mockResolvedValue(false);
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(mockRole);
      mockCatalogsService.findByName.mockResolvedValueOnce(mockStatus);

      mockQueryRunner.manager.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('DB connection lost'));

      await expect(service.create(10, mockDto, currentUser)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if user is not found within neighborhood scope', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update(10, 'invalid-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated email is already registered to another user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockSavedUser);
      mockUserRepository.exists.mockResolvedValueOnce(true);

      await expect(
        service.update(10, 'user-public-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if updated phone is already registered to another user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockSavedUser);
      mockUserRepository.exists
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      await expect(
        service.update(10, 'user-public-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if target user role catalog is missing', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockSavedUser);
      mockUserRepository.exists.mockResolvedValue(false);
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(null);

      await expect(
        service.update(10, 'user-public-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully update user details and assign units within transaction', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockSavedUser);
      mockUserRepository.exists.mockResolvedValue(false);
      mockCatalogsService.findByPublicId
        .mockResolvedValueOnce(mockNewRole)
        .mockResolvedValueOnce(mockUserUnitRole);

      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockNewUnit,
      );
      (mockQueryRunner.manager.save as jest.Mock).mockImplementation(
        (entity, data) => data,
      );
      mockSearchService.findByPublicId.mockResolvedValueOnce({
        ...mockSavedUser,
        ...mockUpdateDto,
      } as any);

      const result = await service.update(
        10,
        'user-public-uuid',
        mockUpdateDto,
        currentUser,
      );

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        UserUnit,
        { userId: mockSavedUser.id, isCurrentOccupant: true },
        { isCurrentOccupant: false },
      );
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(
        UserUnit,
        expect.any(Object),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.firstName).toBe('John Updated');
    });

    it('should rollback transaction and throw InternalServerErrorException on update failure', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockSavedUser);
      mockUserRepository.exists.mockResolvedValue(false);
      mockCatalogsService.findByPublicId.mockResolvedValueOnce(mockNewRole);

      mockQueryRunner.manager.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('Transaction Failed'));

      await expect(
        service.update(10, 'user-public-uuid', mockUpdateDto, currentUser),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { UserService } from './user.service';
//
// describe('UserService', () => {
//   let service: UserService;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UserService],
//     }).compile();
//
//     service = module.get<UserService>(UserService);
//   });
//
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
