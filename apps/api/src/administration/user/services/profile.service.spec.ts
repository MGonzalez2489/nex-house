import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from './profile.service';
import { UserSearchService } from './user-search.service';
import { User, UserProfile } from '@core/database';
import { StorageService } from 'src/storage/storage.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let mockProfileRepository: jest.Mocked<Repository<UserProfile>>;
  let mockSearchService: jest.Mocked<UserSearchService>;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const buildProfile = (overrides: Partial<UserProfile> = {}) =>
    ({
      id: 50,
      userId: 100,
      firstName: 'John',
      lastName: 'Doe',
      phone: '6999999999',
      ...overrides,
    }) as UserProfile;

  beforeEach(async () => {
    mockProfileRepository = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      exists: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserProfile>>;

    mockSearchService = {
      findByPublicIdOrThrow: jest.fn(),
    } as unknown as jest.Mocked<UserSearchService>;

    mockStorageService = {
      uploadFile: jest.fn(),
    } as unknown as jest.Mocked<StorageService>;

    mockConfigService = {
      get: jest.fn().mockReturnValue('uploads'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockProfileRepository,
        },
        { provide: UserSearchService, useValue: mockSearchService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByUserId', () => {
    it('should load the profile with its avatar relation', async () => {
      const profile = buildProfile();
      mockProfileRepository.findOne.mockResolvedValueOnce(profile);

      await expect(service.getByUserId(100)).resolves.toBe(profile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 100 },
        relations: { avatar: true },
      });
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when the user has no profile', async () => {
      mockSearchService.findByPublicIdOrThrow.mockResolvedValueOnce({
        id: 100,
        profile: null,
      } as unknown as User);

      await expect(
        service.update('user-public-uuid', { firstName: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should trim names and return the reloaded profile', async () => {
      const profile = buildProfile();
      mockSearchService.findByPublicIdOrThrow.mockResolvedValueOnce({
        id: 100,
        profile,
      } as unknown as User);
      mockProfileRepository.findOne.mockResolvedValueOnce(profile);

      const result = await service.update('user-public-uuid', {
        firstName: '  Jane ',
        lastName: ' Smith  ',
      });

      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Smith');
      expect(mockProfileRepository.update).toHaveBeenCalledWith(
        profile.id,
        profile,
      );
      expect(result).toBe(profile);
    });

    it('should reject an invalid phone format', async () => {
      mockSearchService.findByPublicIdOrThrow.mockResolvedValueOnce({
        id: 100,
        profile: buildProfile(),
      } as unknown as User);

      await expect(
        service.update('user-public-uuid', { phone: '12345' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject a phone already used by another profile', async () => {
      mockSearchService.findByPublicIdOrThrow.mockResolvedValueOnce({
        id: 100,
        profile: buildProfile(),
      } as unknown as User);
      mockProfileRepository.exists.mockResolvedValueOnce(true);

      await expect(
        service.update('user-public-uuid', { phone: '6141234567' }),
      ).rejects.toThrow(ConflictException);

      expect(mockProfileRepository.exists).toHaveBeenCalledWith({
        where: { phone: '6141234567' },
      });
    });

    it('should persist the formatted phone when it is available', async () => {
      const profile = buildProfile();
      mockSearchService.findByPublicIdOrThrow.mockResolvedValueOnce({
        id: 100,
        profile,
      } as unknown as User);
      mockProfileRepository.exists.mockResolvedValueOnce(false);
      mockProfileRepository.findOne.mockResolvedValueOnce(profile);

      await service.update('user-public-uuid', { phone: '614-123-4567' });

      expect(profile.phone).toBe('6141234567');
    });

    it('should upload the avatar and store its file id', async () => {
      const profile = buildProfile();
      mockSearchService.findByPublicIdOrThrow.mockResolvedValueOnce({
        id: 100,
        profile,
      } as unknown as User);
      mockProfileRepository.findOne.mockResolvedValueOnce(profile);
      mockStorageService.uploadFile.mockResolvedValueOnce({ id: 77 } as never);

      const avatar = { filename: 'avatar.png' } as Express.Multer.File;

      await service.update('user-public-uuid', {}, avatar);

      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('avatars'),
        avatar,
      );
      expect(profile.avatarId).toBe(77);
    });
  });
});
