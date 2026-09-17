import { NeighborhoodScopeGuard } from '@core/guards';
import { Test, TestingModule } from '@nestjs/testing';
import { Neighborhood, User } from '@core/database';
import { ResidentController } from './resident.controller';
import {
  ResidentSearchService,
  ResidentService,
  ResidentStatsService,
} from '../services';
import { SearchUserDto, UpdateUserDto } from '../dtos';
import { PaginatedResult } from '@core/utils';
import { UserStats } from '@nexhouse/shared-domain/interfaces';

describe('ResidentController', () => {
  let controller: ResidentController;
  let mockResidentService: jest.Mocked<ResidentService>;
  let mockSearchService: jest.Mocked<ResidentSearchService>;
  let mockStatsService: jest.Mocked<ResidentStatsService>;

  const mockNeigh = { id: 10, publicId: 'neigh-uuid' } as Neighborhood;
  const mockUser = { id: 100, neighborhoodId: 10 } as User;
  const mockPublicId = 'c9b0a7ed-20a2-4a0b-bf84-cf9537bc2c42';

  const mockSavedUser = {
    id: 100,
    publicId: mockPublicId,
    email: 'test@nexhouse.com',
    neighborhoodId: 10,
    role: { publicId: 'role-uuid', name: 'RESIDENT' },
    status: { publicId: 'status-uuid', name: 'PENDING_ONBOARDING' },
    profile: { publicId: 'profile-uuid', firstName: 'Manuel', lastName: 'G' },
    userUnits: [],
  } as User;

  beforeEach(async () => {
    mockResidentService = {
      create: jest.fn(),
      update: jest.fn(),
      updateAvatar: jest.fn(),
    } as unknown as jest.Mocked<ResidentService>;

    mockSearchService = {
      findAll: jest.fn(),
      findByPublicId: jest.fn(),
    } as unknown as jest.Mocked<ResidentSearchService>;

    mockStatsService = {
      getStats: jest.fn(),
    } as unknown as jest.Mocked<ResidentStatsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResidentController],
      providers: [
        { provide: ResidentService, useValue: mockResidentService },
        { provide: ResidentSearchService, useValue: mockSearchService },
        { provide: ResidentStatsService, useValue: mockStatsService },
      ],
    })
      .overrideGuard(NeighborhoodScopeGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ResidentController>(ResidentController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to the service and returns the created resident', async () => {
      const dto = { email: 'test@nexhouse.com' } as never;
      mockResidentService.create.mockResolvedValue(mockSavedUser);

      const result = await controller.create(dto, mockUser, mockNeigh);

      expect(mockResidentService.create).toHaveBeenCalledWith(
        mockNeigh.id,
        dto,
        mockUser,
      );
      expect(result).toEqual(mockSavedUser);
    });

    it('throws an InternalServerError when the service returns nothing', async () => {
      mockResidentService.create.mockResolvedValue(null);

      await expect(
        controller.create({} as never, mockUser, mockNeigh),
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('delegates to the search service and maps results to models', async () => {
      const dto: SearchUserDto = Object.assign(new SearchUserDto(), {
        first: 0,
        rows: 10,
        showAll: false,
      });
      const response: PaginatedResult<User> = {
        data: [mockSavedUser],
        meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
      };
      mockSearchService.findAll.mockResolvedValue(response as never);

      const result = await controller.findAll(dto, mockNeigh);

      expect(mockSearchService.findAll).toHaveBeenCalledWith(
        mockNeigh.id,
        dto,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual(response.meta);
    });
  });

  describe('findStats', () => {
    it('delegates to the stats service for the current neighborhood', async () => {
      const stats: UserStats = {
        summary: { totalUsers: 2 },
        byRole: { RESIDENT: 2 },
        byStatus: { PENDING_ONBOARDING: 2 },
      };
      mockStatsService.getStats.mockResolvedValue(stats);

      const result = await controller.findStats(mockNeigh);

      expect(mockStatsService.getStats).toHaveBeenCalledWith(mockNeigh.id);
      expect(result).toEqual(stats);
    });
  });

  describe('findById', () => {
    it('delegates to the search service with relations and returns the mapped model', async () => {
      mockSearchService.findByPublicId.mockResolvedValue(mockSavedUser);

      const result = await controller.findById(mockPublicId, mockNeigh);

      expect(mockSearchService.findByPublicId).toHaveBeenCalledWith(
        mockPublicId,
        mockNeigh.id,
        expect.objectContaining({
          neighborhood: true,
          status: true,
          profile: true,
          role: true,
          userUnits: {
            unit: { street: true, type: true },
            userUnitRole: true,
          },
        }),
      );
      expect(result.publicId).toBe(mockPublicId);
      expect(result.email).toBe('test@nexhouse.com');
    });

    it('throws NotFoundException when the resident does not exist', async () => {
      mockSearchService.findByPublicId.mockResolvedValue(null);

      await expect(
        controller.findById(mockPublicId, mockNeigh),
      ).rejects.toThrow('Resident not found.');
    });
  });

  describe('update', () => {
    it('delegates to the service and returns the updated resident', async () => {
      const dto: UpdateUserDto = { userRoleId: 'new-role-uuid' };
      mockResidentService.update.mockResolvedValue(mockSavedUser);

      const result = await controller.update(
        mockPublicId,
        dto,
        mockUser,
        mockNeigh,
      );

      expect(mockResidentService.update).toHaveBeenCalledWith(
        mockNeigh.id,
        mockPublicId,
        dto,
        mockUser,
      );
      expect(result).toEqual(mockSavedUser);
    });
  });

  describe('updateAvatar', () => {
    it('delegates the file to the service for the current user', async () => {
      const file = { filename: 'avatar.png' } as Express.Multer.File;
      mockResidentService.updateAvatar.mockResolvedValue(mockSavedUser);

      const result = await controller.updateAvatar(mockUser, file);

      expect(mockResidentService.updateAvatar).toHaveBeenCalledWith(
        mockUser.id,
        file,
      );
      expect(result).toEqual(mockSavedUser);
    });
  });
});