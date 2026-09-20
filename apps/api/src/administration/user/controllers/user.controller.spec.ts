import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserSearchService, UserService, UserStatsService } from '../services';
import { Neighborhood, User } from '@core/database';
import { UserStats } from '@nexhouse/shared-domain/interfaces';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockStatsService: jest.Mocked<UserStatsService>;
  let mockUserSearchService: jest.Mocked<UserSearchService>;

  const user = {
    id: 1,
    publicId: 'user-public-uuid',
    neighborhoodId: 10,
  } as User;
  const neighborhood = { id: 10 } as Neighborhood;

  beforeEach(async () => {
    mockUserService = { update: jest.fn() } as unknown as jest.Mocked<UserService>;
    mockStatsService = {
      getStats: jest.fn(),
    } as unknown as jest.Mocked<UserStatsService>;
    mockUserSearchService = {
      findByPublicIdOrThrow: jest.fn(),
    } as unknown as jest.Mocked<UserSearchService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: UserStatsService, useValue: mockStatsService },
        { provide: UserSearchService, useValue: mockUserSearchService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the authenticated user with its relations', async () => {
    mockUserSearchService.findByPublicIdOrThrow.mockResolvedValueOnce(user);

    await expect(controller.get(user)).resolves.toBe(user);
    expect(mockUserSearchService.findByPublicIdOrThrow).toHaveBeenCalledWith(
      user.publicId,
      undefined,
      {
        status: true,
        role: true,
        userUnits: { unit: { street: true, type: true }, userUnitRole: true },
      },
    );
  });

  it('should return the neighborhood metrics', async () => {
    const stats = { summary: { totalUsers: 3 } } as UserStats;
    mockStatsService.getStats.mockResolvedValueOnce(stats);

    await expect(controller.findStats(neighborhood)).resolves.toBe(stats);
    expect(mockStatsService.getStats).toHaveBeenCalledWith(neighborhood.id);
  });

  it('should delegate the update to the service with the session context', async () => {
    const dto = { userRoleId: 'role-uuid' };
    mockUserService.update.mockResolvedValueOnce(user);

    await expect(controller.update(dto, user, neighborhood)).resolves.toBe(user);
    expect(mockUserService.update).toHaveBeenCalledWith(
      neighborhood.id,
      user.publicId,
      dto,
      user,
    );
  });
});
