import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations } from 'typeorm';
import { NotFoundException, Logger } from '@nestjs/common';
import { UserSearchService } from './user-search.service';
import { User } from '@core/database';

describe('UserSearchService', () => {
  let service: UserSearchService;
  let mockRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 1,
    publicId: 'user-uuid-123',
    email: 'dev@nexhouse.com',
    name: 'Manuel Gonzalez',
  } as unknown as User;

  const defaultRelations: FindOptionsRelations<User> = {
    neighborhood: true,
  };

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSearchService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserSearchService>(UserSearchService);

    const loggerInstance = (service as unknown as { logger: Logger }).logger;
    jest.spyOn(loggerInstance, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByPublicId', () => {
    it('should successfully find a user by publicId using default relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByPublicId('user-uuid-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'user-uuid-123' },
        relations: defaultRelations,
      });
      expect(result).toEqual(mockUser);
    });

    it('should append neighborhoodId to where criteria when provided', async () => {
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

    it('should override default relations when custom relations are explicitly passed', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const customRelations: FindOptionsRelations<User> = {
        neighborhood: true,
      };

      await service.findByPublicId('user-uuid-123', undefined, customRelations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'user-uuid-123' },
        relations: customRelations,
      });
    });

    it('should return null if the user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByPublicId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByPublicIdOrThrow', () => {
    it('should return the user if found', async () => {
      jest.spyOn(service, 'findByPublicId').mockResolvedValue(mockUser);

      const result = await service.findByPublicIdOrThrow('user-uuid-123');

      expect(result).toEqual(mockUser);
    });

    it('should throw a NotFoundException if user does not exist', async () => {
      jest.spyOn(service, 'findByPublicId').mockResolvedValue(null);

      await expect(service.findByPublicIdOrThrow('invalid-id')).rejects.toThrow(
        new NotFoundException("User with public ID 'invalid-id' not found"),
      );
    });
  });

  describe('findByEmail', () => {
    it('should successfully find a user by email using default relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('dev@nexhouse.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'dev@nexhouse.com' },
        relations: defaultRelations,
      });
      expect(result).toEqual(mockUser);
    });

    it('should append neighborhoodId to where criteria for email query when provided', async () => {
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
  });

  describe('findByEmailOrThrow', () => {
    it('should return the user if found via email', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.findByEmailOrThrow('dev@nexhouse.com');

      expect(result).toEqual(mockUser);
    });

    it('should throw a NotFoundException if email does not exist', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.findByEmailOrThrow('missing@nexhouse.com'),
      ).rejects.toThrow(
        new NotFoundException(
          "User with email 'missing@nexhouse.com' not found",
        ),
      );
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { UserSearchService } from './user-search.service';
//
// describe('UserSearchService', () => {
//   let service: UserSearchService;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UserSearchService],
//     }).compile();
//
//     service = module.get<UserSearchService>(UserSearchService);
//   });
//
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
