import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from '../services';
import { User, UserProfile } from '@core/database';

describe('ProfileController', () => {
  let controller: ProfileController;
  let mockProfileService: jest.Mocked<ProfileService>;

  const user = { id: 1, publicId: 'user-public-uuid' } as User;

  const profile = {
    id: 50,
    userId: 1,
    publicId: 'profile-public-uuid',
    firstName: 'John',
    lastName: 'Doe',
    phone: '6141234567',
    avatar: undefined,
  } as unknown as UserProfile;

  beforeEach(async () => {
    mockProfileService = {
      getByUserId: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ProfileService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: mockProfileService }],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the mapped profile of the authenticated user', async () => {
    mockProfileService.getByUserId.mockResolvedValueOnce(profile);

    const result = await controller.get(user);

    expect(mockProfileService.getByUserId).toHaveBeenCalledWith(user.id);
    expect(result.publicId).toBe('profile-public-uuid');
    expect(result.firstName).toBe('John');
  });

  it('should throw NotFoundException when the profile does not exist', async () => {
    mockProfileService.getByUserId.mockResolvedValueOnce(null);

    await expect(controller.get(user)).rejects.toThrow(NotFoundException);
  });

  it('should delegate the profile update', async () => {
    const dto = { firstName: 'Jane' };
    const avatar = { filename: 'avatar.png' } as Express.Multer.File;
    mockProfileService.update.mockResolvedValueOnce(profile);

    await expect(controller.update(dto, user, avatar)).resolves.toBe(profile);
    expect(mockProfileService.update).toHaveBeenCalledWith(
      user.publicId,
      dto,
      avatar,
    );
  });
});
