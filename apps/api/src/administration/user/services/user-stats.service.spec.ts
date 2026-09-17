import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserStatsService } from './user-stats.service';
import { User } from '@core/database';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';

describe('UserStatsService', () => {
  let service: UserStatsService;
  let mockRepository: jest.Mocked<Repository<User>>;
  let roleQueryBuilder: jest.Mocked<SelectQueryBuilder<User>>;
  let statusQueryBuilder: jest.Mocked<SelectQueryBuilder<User>>;

  const buildQueryBuilder = () =>
    ({
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    }) as unknown as jest.Mocked<SelectQueryBuilder<User>>;

  beforeEach(async () => {
    roleQueryBuilder = buildQueryBuilder();
    statusQueryBuilder = buildQueryBuilder();

    mockRepository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(roleQueryBuilder)
        .mockReturnValueOnce(statusQueryBuilder),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStatsService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserStatsService>(UserStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should aggregate role and status counts scoped to the neighborhood', async () => {
    roleQueryBuilder.getRawMany.mockResolvedValueOnce([
      { roleCode: 'ADMIN', count: '2' },
      { roleCode: 'RESIDENT', count: '3' },
    ]);
    statusQueryBuilder.getRawMany.mockResolvedValueOnce([
      { statusCode: 'ACTIVE', count: '4' },
      { statusCode: 'PENDING_ONBOARDING', count: '1' },
    ]);

    const result = await service.getStats(10);

    expect(result).toEqual({
      summary: { totalUsers: 5 },
      byRole: { ADMIN: 2, RESIDENT: 3 },
      byStatus: { ACTIVE: 4, PENDING_ONBOARDING: 1 },
    });
  });

  it('should exclude super admins and filter by neighborhood in both queries', async () => {
    roleQueryBuilder.getRawMany.mockResolvedValueOnce([]);
    statusQueryBuilder.getRawMany.mockResolvedValueOnce([]);

    await service.getStats(10);

    const superAdminFilter = {
      superAdminRole: UserRoleEnum.SUPERADMIN,
    };

    for (const qb of [roleQueryBuilder, statusQueryBuilder]) {
      expect(qb.where).toHaveBeenCalledWith(
        'role.name != :superAdminRole',
        superAdminFilter,
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.neighborhoodId = :neighborhoodId',
        { neighborhoodId: 10 },
      );
    }
  });

  it('should return empty buckets when there is no data', async () => {
    roleQueryBuilder.getRawMany.mockResolvedValueOnce([]);
    statusQueryBuilder.getRawMany.mockResolvedValueOnce([]);

    await expect(service.getStats(10)).resolves.toEqual({
      summary: { totalUsers: 0 },
      byRole: {},
      byStatus: {},
    });
  });
});
