import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { User, UserStatus } from '@core/database';
import { UserStatusEnum, OnboardingStepEnum } from '@nexhouse/shared-domain/enums';
import { CatalogsService } from '@catalogs/services';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockCatalogsService: jest.Mocked<CatalogsService>;

  const mockActiveStatus = {
    id: 3,
    name: UserStatusEnum.ACTIVE,
  } as unknown as UserStatus;

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 100,
      publicId: 'user-public-uuid',
      requirePwdChange: true,
      isFirstAdmin: false,
      status: { id: 9, name: UserStatusEnum.PENDING_ONBOARDING },
      profile: { firstName: 'John', lastName: 'Doe', phone: '6141234567' },
      userUnits: [],
      ...overrides,
    }) as unknown as User;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    } as unknown as jest.Mocked<Repository<User>>;

    mockCatalogsService = {
      findByName: jest.fn().mockResolvedValue(mockActiveStatus),
    } as unknown as jest.Mocked<CatalogsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: CatalogsService, useValue: mockCatalogsService },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOnboardingStatus', () => {
    it('should throw NotFoundException when the user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.getOnboardingStatus('missing-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should hide the unit step for non-admin users', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(
        buildUser({
          isFirstAdmin: false,
          requirePwdChange: false,
          status: { id: 3, name: UserStatusEnum.ACTIVE },
        } as Partial<User>),
      );

      const result = await service.getOnboardingStatus('user-public-uuid');

      expect(result.steps.map((step) => step.id)).not.toContain(
        OnboardingStepEnum.CREATE_UNIT,
      );
      expect(result.currentStepId).toBe(OnboardingStepEnum.COMPLETE);
      expect(result.isCompleted).toBe(true);
    });

    it('should require the unit step for the initial admin without units', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(
        buildUser({ isFirstAdmin: true, userUnits: [] } as Partial<User>),
      );

      const result = await service.getOnboardingStatus('user-public-uuid');

      expect(result.steps.map((step) => step.id)).toContain(
        OnboardingStepEnum.CREATE_UNIT,
      );
      expect(result.currentStepId).toBe(OnboardingStepEnum.WELCOME);
      expect(result.isCompleted).toBe(false);
    });

    it('should mark the unit step completed once the admin owns a unit', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(
        buildUser({
          isFirstAdmin: true,
          requirePwdChange: false,
          userUnits: [{ id: 1 }],
        } as unknown as Partial<User>),
      );

      const result = await service.getOnboardingStatus('user-public-uuid');

      const unitStep = result.steps.find(
        (step) => step.id === OnboardingStepEnum.CREATE_UNIT,
      );
      expect(unitStep?.completed).toBe(true);
    });

    it('should treat a null profile as incomplete without crashing', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(
        buildUser({ profile: null } as unknown as Partial<User>),
      );

      const result = await service.getOnboardingStatus('user-public-uuid');

      const profileStep = result.steps.find(
        (step) => step.id === OnboardingStepEnum.GENERAL_FORM,
      );
      expect(profileStep?.completed).toBe(false);
    });
  });

  describe('completeOnboarding', () => {
    it('should activate the user status', async () => {
      await service.completeOnboarding(100);

      expect(mockCatalogsService.findByName).toHaveBeenCalledWith(
        UserStatus,
        UserStatusEnum.ACTIVE,
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(100, {
        statusId: mockActiveStatus.id,
      });
    });
  });
});
