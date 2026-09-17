import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NeighStreet, Unit, UnitStatus, UnitType, User, UserUnit, UserUnitRole } from '@core/database';
import { CatalogsService } from '@catalogs/services';
import { NeighStreetService } from '@administration/neighborhood/services';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { CreateUnitDto } from '../dtos';
import { UnitService } from './unit.service';

describe('UnitService', () => {
  let service: UnitService;
  let mockCatalogsService: {
    findByPublicId: jest.Mock;
    findByName: jest.Mock;
  };
  let mockNeighStreetService: { findByPublicId: jest.Mock };
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockManager: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };

  const currentUserId = 1;

  const mockUnitType = { id: 7, publicId: 'type-uuid' } as UnitType;
  const mockStreet = {
    id: 6,
    publicId: 'street-uuid',
    neighborhoodId: 10,
  } as NeighStreet;
  const mockUnitStatus = { id: 8, name: 'vacant' } as UnitStatus;
  const mockUserUnitRole = { id: 4, publicId: 'role-uuid' } as UserUnitRole;
  const mockUnit = { id: 5, publicId: 'unit-uuid', identifier: 'A-101' } as Unit;
  const mockUser = { id: 100, publicId: 'user-uuid' } as User;

  const baseDto: CreateUnitDto = {
    unitIdentifier: 'a-101',
    streetId: 'street-uuid',
    unitTypeId: 'type-uuid',
    unitRoleId: 'role-uuid',
    isCurrentOccupant: true,
  };

  const occupiedDto: CreateUnitDto = { ...baseDto, userId: 'user-uuid' };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockManager = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
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
    };

    mockNeighStreetService = {
      findByPublicId: jest.fn(),
    };

    mockCatalogsService.findByPublicId.mockImplementation(async (entity) => {
      if (entity === UnitType) return mockUnitType;
      if (entity === UserUnitRole) return mockUserUnitRole;
      return null;
    });
    mockCatalogsService.findByName.mockResolvedValue(mockUnitStatus);
    mockNeighStreetService.findByPublicId.mockResolvedValue(mockStreet);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        { provide: CatalogsService, useValue: mockCatalogsService },
        { provide: NeighStreetService, useValue: mockNeighStreetService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<UnitService>(UnitService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws BadRequestException when required fields are missing', async () => {
      await expect(
        service.create(
          10,
          { ...baseDto, unitIdentifier: undefined } as CreateUnitDto,
          currentUserId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when assigning a user without a unit role', async () => {
      await expect(
        service.create(
          10,
          { ...occupiedDto, unitRoleId: undefined } as CreateUnitDto,
          currentUserId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the identifier has invalid characters', async () => {
      await expect(
        service.create(10, { ...baseDto, unitIdentifier: 'A 101!' }, currentUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the street does not exist', async () => {
      mockNeighStreetService.findByPublicId.mockResolvedValueOnce(null);

      await expect(
        service.create(10, baseDto, currentUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the street belongs to another neighborhood', async () => {
      mockNeighStreetService.findByPublicId.mockResolvedValueOnce({
        ...mockStreet,
        neighborhoodId: 99,
      });

      await expect(
        service.create(10, baseDto, currentUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when a unit with the same identifier already exists', async () => {
      mockManager.findOne.mockResolvedValueOnce(mockUnit);

      await expect(
        service.create(10, baseDto, currentUserId),
      ).rejects.toThrow(ConflictException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('throws NotFoundException when the assigned user is not found', async () => {
      mockManager.findOne
        .mockResolvedValueOnce(null) // no existing unit
        .mockResolvedValueOnce(null); // user lookup
      mockManager.create.mockImplementation((_entity, data) => data);
      mockManager.save.mockImplementation(async (_entity, data) => data);

      await expect(
        service.create(10, occupiedDto, currentUserId),
      ).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('creates a vacant unit without an assignment', async () => {
      mockManager.findOne.mockResolvedValueOnce(null);
      mockManager.create.mockImplementation((_entity, data) => data);
      mockManager.save.mockResolvedValueOnce(mockUnit);

      const result = await service.create(10, baseDto, currentUserId);

      expect(mockCatalogsService.findByName).toHaveBeenCalledWith(
        UnitStatus,
        'vacant',
      );
      expect(mockManager.create).toHaveBeenCalledWith(
        Unit,
        expect.objectContaining({
          identifier: 'A-101',
          neighborhoodId: 10,
          streetId: mockStreet.id,
          typeId: mockUnitType.id,
          statusId: mockUnitStatus.id,
          createdBy: currentUserId,
        }),
      );
      expect(mockManager.create).not.toHaveBeenCalledWith(
        UserUnit,
        expect.anything(),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.identifier).toBe('A-101');
    });

    it('creates an occupied unit and assigns the user', async () => {
      mockManager.findOne
        .mockResolvedValueOnce(null) // no existing unit
        .mockResolvedValueOnce(mockUser); // user lookup
      mockManager.create.mockImplementation((_entity, data) => data);
      mockManager.save
        .mockResolvedValueOnce(mockUnit) // unit
        .mockResolvedValueOnce({ id: 200 }); // assignment

      await service.create(10, occupiedDto, currentUserId);

      expect(mockCatalogsService.findByName).toHaveBeenCalledWith(
        UnitStatus,
        'ocuppied',
      );
      expect(mockManager.create).toHaveBeenCalledWith(
        UserUnit,
        expect.objectContaining({
          unitId: mockUnit.id,
          userId: mockUser.id,
          userUnitRole: mockUserUnitRole,
          isCurrentOccupant: true,
        }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('rolls back and throws InternalServerErrorException on an unexpected failure', async () => {
      mockManager.findOne.mockResolvedValueOnce(null);
      mockManager.create.mockImplementation((_entity, data) => data);
      mockManager.save.mockRejectedValueOnce(new Error('DB connection lost'));

      await expect(
        service.create(10, baseDto, currentUserId),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
