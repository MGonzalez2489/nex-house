import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserSearchService } from './user-search.service';
import { User } from '@core/database';

describe('UserSearchService', () => {
  let service: UserSearchService;
  let mockRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 1,
    publicId: 'user-uuid-123',
    email: 'dev@nexhouse.com',
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should query by the provided predicate using default relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne({ email: 'dev@nexhouse.com' });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'dev@nexhouse.com' },
        relations: defaultRelations,
      });
      expect(result).toEqual(mockUser);
    });

    it('should honor custom relations when provided', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const relations: FindOptionsRelations<User> = { status: true };

      await service.findOne({ email: 'dev@nexhouse.com' }, relations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'dev@nexhouse.com' },
        relations,
      });
    });
  });

  describe('findByPublicId', () => {
    it('should find a user by publicId using default relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByPublicId('user-uuid-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'user-uuid-123' },
        relations: defaultRelations,
      });
      expect(result).toEqual(mockUser);
    });

    it('should append the neighborhoodId criteria when provided', async () => {
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

    it('should override default relations when custom relations are passed', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const customRelations: FindOptionsRelations<User> = { profile: true };

      await service.findByPublicId('user-uuid-123', undefined, customRelations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'user-uuid-123' },
        relations: customRelations,
      });
    });

    it('should return null when the user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByPublicId('non-existent')).resolves.toBeNull();
    });
  });

  describe('findByPublicIdOrThrow', () => {
    it('should return the user when found', async () => {
      jest.spyOn(service, 'findByPublicId').mockResolvedValue(mockUser);

      await expect(
        service.findByPublicIdOrThrow('user-uuid-123'),
      ).resolves.toEqual(mockUser);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      jest.spyOn(service, 'findByPublicId').mockResolvedValue(null);

      await expect(service.findByPublicIdOrThrow('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email using default relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('dev@nexhouse.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'dev@nexhouse.com' },
        relations: defaultRelations,
      });
      expect(result).toEqual(mockUser);
    });

    it('should append the neighborhoodId criteria when provided', async () => {
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
    it('should return the user when found by email', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);

      await expect(
        service.findByEmailOrThrow('dev@nexhouse.com'),
      ).resolves.toEqual(mockUser);
    });

    it('should throw NotFoundException when the email does not exist', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.findByEmailOrThrow('missing@nexhouse.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
