import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService, ProfileService, UserService } from '../services';
import { UnitService } from '@administration/units/services';
import { User, UserProfile } from '@core/database';
import { OnboardingStatusResponseDto, UpdateUserProfileDto } from '../dtos';
import { OnboardingStepEnum } from '@nexhouse/shared-domain/enums';

describe('OnboardingController', () => {
  let controller: OnboardingController;
  let mockOnboardingService: jest.Mocked<OnboardingService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockProfileService: jest.Mocked<ProfileService>;
  let mockUnitService: jest.Mocked<UnitService>;

  const user = {
    id: 1,
    publicId: 'user-public-uuid',
    neighborhoodId: 10,
  } as User;

  const status: OnboardingStatusResponseDto = {
    isCompleted: false,
    currentStepId: OnboardingStepEnum.SECURITY,
    steps: [],
  };

  beforeEach(async () => {
    mockOnboardingService = {
      getOnboardingStatus: jest.fn().mockResolvedValue(status),
      completeOnboarding: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OnboardingService>;
    mockUserService = {
      changePassword: jest.fn(),
    } as unknown as jest.Mocked<UserService>;
    mockProfileService = {
      update: jest.fn(),
    } as unknown as jest.Mocked<ProfileService>;
    mockUnitService = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    } as unknown as jest.Mocked<UnitService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: UserService, useValue: mockUserService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: UnitService, useValue: mockUnitService },
      ],
    }).compile();

    controller = module.get<OnboardingController>(OnboardingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the onboarding status', async () => {
    await expect(controller.getStatus(user)).resolves.toBe(status);
    expect(mockOnboardingService.getOnboardingStatus).toHaveBeenCalledWith(
      user.publicId,
    );
  });

  it('should change the password and return the refreshed status', async () => {
    mockUserService.changePassword.mockResolvedValueOnce(true);

    await expect(
      controller.changePassword(
        { oldPassword: 'old', newPassword: 'new' },
        user,
      ),
    ).resolves.toBe(status);

    expect(mockUserService.changePassword).toHaveBeenCalledWith(
      user.publicId,
      'old',
      'new',
    );
  });

  it('should throw BadRequestException when the password change fails', async () => {
    mockUserService.changePassword.mockResolvedValueOnce(false);

    await expect(
      controller.changePassword(
        { oldPassword: 'old', newPassword: 'new' },
        user,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should update the profile and return the refreshed status', async () => {
    mockProfileService.update.mockResolvedValueOnce({ id: 1 } as UserProfile);

    await expect(
      controller.updateProfile({ firstName: 'Jane' }, user),
    ).resolves.toBe(status);
  });

  it('should throw InternalServerErrorException when the profile is not persisted', async () => {
    mockProfileService.update.mockResolvedValueOnce(null);

    await expect(
      controller.updateProfile({ firstName: 'Jane' } as UpdateUserProfileDto, user),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should create the onboarding unit and return the refreshed status', async () => {
    const dto = {
      unitIdentifier: 'A-101',
      streetId: 'street-uuid',
      unitTypeId: 'type-uuid',
      unitRoleId: 'role-uuid',
      isCurrentOccupant: true,
    };

    await expect(controller.createUnit(dto, user)).resolves.toBe(status);
    expect(mockUnitService.create).toHaveBeenCalledWith(
      user.neighborhoodId,
      dto,
      user.id,
    );
  });

  it('should complete the onboarding', async () => {
    await expect(controller.complete(user)).resolves.toEqual({ success: true });
    expect(mockOnboardingService.completeOnboarding).toHaveBeenCalledWith(
      user.id,
    );
  });
});
