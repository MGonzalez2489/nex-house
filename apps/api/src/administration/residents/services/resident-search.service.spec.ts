import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from '@core/database';
import { SearchUserDto } from '../dtos';
import * as paginationUtils from '@core/utils';
import { ResidentSearchService } from './resident-search.service';

jest.mock('@core/utils', () => ({
  ...jest.requireActual('@core/utils'),
  paginateQuery: jest.fn(),
}));

describe('ResidentSearchService', () => {
  let service: ResidentSearchService;
  let mockRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 1,
    publicId: 'user-uuid-123',
    email: 'dev@nexhouse.com',
    neighborhoodId: 1,
  } as unknown as User;

  const defaultRelations: FindOptionsRelations<User> = {
    neighborhood: true,
  };

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResidentSearchService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ResidentSearchService>(ResidentSearchService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<User>>;

    const mockPaginationResult = {
      data: [mockUser],
      meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
    };

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
      } as unknown as jest.Mocked<SelectQueryBuilder<User>>;

      mockRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      jest.mocked(paginationUtils.paginateQuery).mockReset();
    });

    it('returns a paginated wrapper when options.raw is omitted', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      const dto: SearchUserDto = Object.assign(new SearchUserDto(), {
        first: 0,
        rows: 10,
        showAll: false,
      });
      const result = await service.findAll(1, dto);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('users');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'neighborhood.id = :neighborhoodId',
        { neighborhoodId: 1 },
      );
      expect(result).toEqual(mockPaginationResult);
    });

    it('returns a raw array when options.raw is true', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      const dto: SearchUserDto = Object.assign(new SearchUserDto(), {
        first: 0,
        rows: 10,
        showAll: false,
      });
      const result = await service.findAll(1, dto, { raw: true });

      expect(result).toEqual([mockUser]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('appends role.name and status.name filters when provided', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      const dto: SearchUserDto = Object.assign(new SearchUserDto(), {
        first: 0,
        rows: 10,
        showAll: false,
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      await service.findAll(1, dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'role.name = :role',
        { role: 'ADMIN' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'status.name = :status',
        { status: 'ACTIVE' },
      );
    });

    it('parses globalFilter into word-level OR brackets across profile, email, phone, street and unit fields', async () => {
      jest
        .mocked(paginationUtils.paginateQuery)
        .mockResolvedValue(mockPaginationResult);

      const dto: SearchUserDto = Object.assign(new SearchUserDto(), {
        first: 0,
        rows: 10,
        showAll: false,
        globalFilter: 'Manuel Unit10',
      });

      await service.findAll(1, dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });
  });

  describe('findByPublicId', () => {
    it('returns the user with default relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByPublicId('user-uuid-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'user-uuid-123' },
        relations: defaultRelations,
      });
      expect(result).toEqual(mockUser);
    });

    it('scopes by neighborhood when provided', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await service.findByPublicId('user-uuid-123', 99);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          publicId: 'user-uuid-123',
          neighborhood: { id: 99 },
        },
        relations: defaultRelations,
      });
    });

    it('overrides default relations when custom ones are passed', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const customRelations: FindOptionsRelations<User> = {
        profile: true,
        role: true,
      };

      await service.findByPublicId('user-uuid-123', undefined, customRelations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'user-uuid-123' },
        relations: customRelations,
      });
    });

    it('returns null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByPublicId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByPublicIdOrThrow', () => {
    it('returns the user when found', async () => {
      jest.spyOn(service, 'findByPublicId').mockResolvedValue(mockUser);

      const result = await service.findByPublicIdOrThrow('user-uuid-123');

      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when not found', async () => {
      jest.spyOn(service, 'findByPublicId').mockResolvedValue(null);

      await expect(service.findByPublicIdOrThrow('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('returns the user with default relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('dev@nexhouse.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'dev@nexhouse.com' },
        relations: defaultRelations,
      });
      expect(result).toEqual(mockUser);
    });

    it('scopes by neighborhood when provided', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await service.findByEmail('dev@nexhouse.com', 50);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'dev@nexhouse.com',
          neighborhood: { id: 50 },
        },
        relations: defaultRelations,
      });
    });

    it('returns null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('missing@nexhouse.com');

      expect(result).toBeNull();
    });
  });

  describe('findByEmailOrThrow', () => {
    it('returns the user when found', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.findByEmailOrThrow('dev@nexhouse.com');

      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when not found', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.findByEmailOrThrow('missing@nexhouse.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});