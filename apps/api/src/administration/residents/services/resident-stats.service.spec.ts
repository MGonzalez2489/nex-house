import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '@core/database';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { ResidentStatsService } from './resident-stats.service';

describe('ResidentStatsService', () => {
  let service: ResidentStatsService;
  let mockRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    mockRepository = {
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResidentStatsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ResidentStatsService>(ResidentStatsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    let mockRoleQuery: jest.Mocked<SelectQueryBuilder<User>>;
    let mockStatusQuery: jest.Mocked<SelectQueryBuilder<User>>;

    beforeEach(() => {
      mockRoleQuery = buildQueryMock();
      mockStatusQuery = buildQueryMock();

      mockRepository.createQueryBuilder
        .mockReturnValueOnce(mockRoleQuery)
        .mockReturnValueOnce(mockStatusQuery);
    });

    it('aggregates role and status counts scoped to the neighborhood, excluding super admins', async () => {
      mockRoleQuery.getRawMany.mockResolvedValue([
        { roleCode: 'ADMIN', count: '2' },
        { roleCode: 'RESIDENT', count: '8' },
      ]);
      mockStatusQuery.getRawMany.mockResolvedValue([
        { statusCode: 'ACTIVE', count: '9' },
        { statusCode: 'PENDING_ONBOARDING', count: '1' },
      ]);

      const result = await service.getStats(10);

      expect(result).toEqual({
        summary: { totalUsers: 10 },
        byRole: { ADMIN: 2, RESIDENT: 8 },
        byStatus: { ACTIVE: 9, PENDING_ONBOARDING: 1 },
      });

      expect(mockRoleQuery.innerJoin).toHaveBeenCalledWith('user.role', 'role');
      expect(mockRoleQuery.andWhere).toHaveBeenCalledWith(
        'user.neighborhoodId = :neighborhoodId',
        { neighborhoodId: 10 },
      );
      expect(mockRoleQuery.where).toHaveBeenCalledWith(
        'role.name != :superAdminRole',
        { superAdminRole: UserRoleEnum.SUPERADMIN },
      );
      expect(mockStatusQuery.andWhere).toHaveBeenCalledWith(
        'user.neighborhoodId = :neighborhoodId',
        { neighborhoodId: 10 },
      );
    });

    it('returns empty aggregates when no users exist', async () => {
      mockRoleQuery.getRawMany.mockResolvedValue([]);
      mockStatusQuery.getRawMany.mockResolvedValue([]);

      const result = await service.getStats(10);

      expect(result).toEqual({
        summary: { totalUsers: 0 },
        byRole: {},
        byStatus: {},
      });
    });

    it('uses both inner joins for the status aggregation query', async () => {
      mockRoleQuery.getRawMany.mockResolvedValue([]);
      mockStatusQuery.getRawMany.mockResolvedValue([]);

      await service.getStats(10);

      expect(mockStatusQuery.innerJoin).toHaveBeenCalledWith(
        'user.role',
        'role',
      );
      expect(mockStatusQuery.innerJoin).toHaveBeenCalledWith(
        'user.status',
        'status',
      );
    });
  });

  function buildQueryMock(): jest.Mocked<SelectQueryBuilder<User>> {
    return {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<User>>;
  }
});