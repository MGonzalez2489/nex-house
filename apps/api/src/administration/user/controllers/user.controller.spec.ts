import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos';
import { User, Neighborhood } from '@core/database';
import { NeighborhoodScopeGuard } from '@core/guards';
import { UserSearchService } from '../services';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockSearchService: jest.Mocked<UserSearchService>;

  const mockUser = { id: 1, neighborhoodId: 10 } as User;
  const mockNeigh = { id: 10 } as Neighborhood;
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

  const mockSavedUser = { id: 100, publicId: 'user-public-uuid' } as User;

  beforeEach(async () => {
    mockUserService = {
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: UserSearchService, useValue: mockSearchService },
      ],
    })
      .overrideGuard(NeighborhoodScopeGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should successfully delegate user creation to UserService', async () => {
      mockUserService.create.mockResolvedValueOnce(mockSavedUser);

      const result = await controller.create(mockDto, mockUser, mockNeigh);

      expect(mockUserService.create).toHaveBeenCalledWith(
        mockNeigh.id,
        mockDto,
        mockUser,
      );
      expect(result).toEqual(mockSavedUser);
    });

    it('should throw InternalServerErrorException if UserService returns null/undefined', async () => {
      mockUserService.create.mockResolvedValueOnce(null);

      await expect(
        controller.create(mockDto, mockUser, mockNeigh),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
