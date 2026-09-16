import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  OnboardingService,
  UserSearchService,
  UserService,
} from '@administration/user/services';
import { REFRESH_TOKEN_DURATION } from '@auth/constants';
import { User } from '@core/database';
import { CryptoService } from '@core/services';
import {
  OnboardingStepEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@nexhouse/shared-domain/enums';
import {
  Response as ExpressResponse,
} from 'express';
import { LoginDto } from '../dtos';
import { SessionService } from './session.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserSearchService: jest.Mocked<UserSearchService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockCryptoService: jest.Mocked<CryptoService>;
  let mockOnboardingService: jest.Mocked<OnboardingService>;

  const mockLoginDto: LoginDto = {
    email: 'dev@nexhouse.com',
    password: 'securePassword123',
  };
  const mockIp = '127.0.0.1';
  const mockAgent = 'Chrome';

  const baseMockUser = {
    id: 1,
    publicId: 'user-public-1',
    email: 'dev@nexhouse.com',
    password: 'hashed-password-string',
    role: { name: UserRoleEnum.RESIDENT },
    status: { name: UserStatusEnum.ACTIVE },
    neighborhood: { id: 10, isActive: true },
  } as unknown as User;

  const mockSession = {
    token: 'jwt',
    refreshToken: 'rt',
    exp: 123,
    user: {} as never,
  };

  let mockResponse: { cookie: jest.Mock; clearCookie: jest.Mock };

  beforeEach(async () => {
    mockUserSearchService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserSearchService>;

    mockUserService = {
      cleanPwdRecoveryState: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    mockSessionService = {
      createSession: jest.fn(),
      refreshSession: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    mockCryptoService = {
      compare: jest.fn(),
    } as unknown as jest.Mocked<CryptoService>;

    mockOnboardingService = {
      getOnboardingStatus: jest.fn(),
      completeOnboarding: jest.fn(),
    } as unknown as jest.Mocked<OnboardingService>;

    mockResponse = { cookie: jest.fn(), clearCookie: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserSearchService, useValue: mockUserSearchService },
        { provide: UserService, useValue: mockUserService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: CryptoService, useValue: mockCryptoService },
        { provide: OnboardingService, useValue: mockOnboardingService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const login = () => service.login(mockLoginDto, mockAgent, mockIp);

    it('should authenticate an active resident and dispatch a session', async () => {
      mockUserSearchService.findByEmail.mockResolvedValue(baseMockUser);
      mockCryptoService.compare.mockResolvedValue(true);
      mockSessionService.createSession.mockResolvedValue(mockSession);

      const result = await login();

      expect(mockUserSearchService.findByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
        undefined,
        { neighborhood: true, role: true, status: true },
      );
      expect(mockCryptoService.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        baseMockUser.password,
      );
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        baseMockUser,
        mockAgent,
        mockIp,
      );
      expect(result.token).toBe('jwt');
    });

    it('should throw UnauthorizedException when the email does not match any user', async () => {
      mockUserSearchService.findByEmail.mockResolvedValue(null);

      await expect(login()).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(mockCryptoService.compare).not.toHaveBeenCalled();
      expect(mockSessionService.createSession).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the password comparison fails', async () => {
      mockUserSearchService.findByEmail.mockResolvedValue(baseMockUser);
      mockCryptoService.compare.mockResolvedValue(false);

      await expect(login()).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(mockSessionService.createSession).not.toHaveBeenCalled();
    });

    it('should bypass neighborhood gates for a SUPERADMIN', async () => {
      const superAdminUser = {
        ...baseMockUser,
        role: { name: UserRoleEnum.SUPERADMIN },
        neighborhood: null,
      } as unknown as User;
      mockUserSearchService.findByEmail.mockResolvedValue(superAdminUser);
      mockCryptoService.compare.mockResolvedValue(true);
      mockSessionService.createSession.mockResolvedValue(mockSession);

      await login();

      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        superAdminUser,
        mockAgent,
        mockIp,
      );
    });

    it('should throw ForbiddenException when the resident has no neighborhood', async () => {
      const detachedUser = {
        ...baseMockUser,
        neighborhood: null,
      } as unknown as User;
      mockUserSearchService.findByEmail.mockResolvedValue(detachedUser);
      mockCryptoService.compare.mockResolvedValue(true);

      await expect(login()).rejects.toThrow(
        new ForbiddenException('Invalid neighborhood assignation.'),
      );
    });

    it('should throw ForbiddenException when the neighborhood is not active', async () => {
      const suspendedTenantUser = {
        ...baseMockUser,
        neighborhood: { id: 10, isActive: false },
      } as unknown as User;
      mockUserSearchService.findByEmail.mockResolvedValue(suspendedTenantUser);
      mockCryptoService.compare.mockResolvedValue(true);

      await expect(login()).rejects.toThrow(
        new ForbiddenException('Neighborhood not available.'),
      );
    });

    it('should throw ForbiddenException for an INACTIVE resident', async () => {
      const inactiveUser = {
        ...baseMockUser,
        status: { name: UserStatusEnum.INACTIVE },
      } as unknown as User;
      mockUserSearchService.findByEmail.mockResolvedValue(inactiveUser);
      mockCryptoService.compare.mockResolvedValue(true);

      await expect(login()).rejects.toThrow(
        new ForbiddenException(
          'Authentication disabled. Contact your administrator.',
        ),
      );
    });

    it('should throw ForbiddenException for an INACTIVE SUPERADMIN', async () => {
      const inactiveSuperAdmin = {
        ...baseMockUser,
        role: { name: UserRoleEnum.SUPERADMIN },
        neighborhood: null,
        status: { name: UserStatusEnum.INACTIVE },
      } as unknown as User;
      mockUserSearchService.findByEmail.mockResolvedValue(inactiveSuperAdmin);
      mockCryptoService.compare.mockResolvedValue(true);

      await expect(login()).rejects.toThrow(
        new ForbiddenException(
          'Authentication disabled. Contact your administrator.',
        ),
      );
      expect(mockSessionService.createSession).not.toHaveBeenCalled();
    });

    it('should autocomplete onboarding and refresh the user when the last step is missing', async () => {
      const pendingOnboardingUser = {
        ...baseMockUser,
        status: { name: UserStatusEnum.PENDING_ONBOARDING },
      } as unknown as User;
      const completedUser = {
        ...baseMockUser,
        status: { name: UserStatusEnum.ACTIVE },
      } as unknown as User;
      mockUserSearchService.findByEmail
        .mockResolvedValueOnce(pendingOnboardingUser)
        .mockResolvedValueOnce(completedUser);
      mockCryptoService.compare.mockResolvedValue(true);
      mockOnboardingService.getOnboardingStatus.mockResolvedValue({
        isCompleted: false,
        currentStepId: OnboardingStepEnum.COMPLETE,
        steps: [],
      });
      mockSessionService.createSession.mockResolvedValue(mockSession);

      await login();

      expect(mockOnboardingService.completeOnboarding).toHaveBeenCalledWith(
        pendingOnboardingUser.id,
      );
      expect(mockUserSearchService.findByEmail).toHaveBeenCalledTimes(2);
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        completedUser,
        mockAgent,
        mockIp,
      );
    });

    it('should not autocomplete onboarding when it is already completed', async () => {
      const pendingOnboardingUser = {
        ...baseMockUser,
        status: { name: UserStatusEnum.PENDING_ONBOARDING },
      } as unknown as User;
      mockUserSearchService.findByEmail.mockResolvedValue(pendingOnboardingUser);
      mockCryptoService.compare.mockResolvedValue(true);
      mockOnboardingService.getOnboardingStatus.mockResolvedValue({
        isCompleted: true,
        currentStepId: OnboardingStepEnum.WELCOME,
        steps: [],
      });
      mockSessionService.createSession.mockResolvedValue(mockSession);

      await login();

      expect(mockOnboardingService.completeOnboarding).not.toHaveBeenCalled();
      expect(mockUserSearchService.findByEmail).toHaveBeenCalledTimes(1);
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        pendingOnboardingUser,
        mockAgent,
        mockIp,
      );
    });

    it('should not autocomplete onboarding when the current step is not COMPLETE', async () => {
      const pendingOnboardingUser = {
        ...baseMockUser,
        status: { name: UserStatusEnum.PENDING_ONBOARDING },
      } as unknown as User;
      mockUserSearchService.findByEmail.mockResolvedValue(pendingOnboardingUser);
      mockCryptoService.compare.mockResolvedValue(true);
      mockOnboardingService.getOnboardingStatus.mockResolvedValue({
        isCompleted: false,
        currentStepId: OnboardingStepEnum.GENERAL_FORM,
        steps: [],
      });
      mockSessionService.createSession.mockResolvedValue(mockSession);

      await login();

      expect(mockOnboardingService.completeOnboarding).not.toHaveBeenCalled();
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        pendingOnboardingUser,
        mockAgent,
        mockIp,
      );
    });

    it('should clean the password-recovery state and log the user in', async () => {
      const recoveryUser = {
        ...baseMockUser,
        status: { name: UserStatusEnum.PASSWORD_RECOVERY },
      } as unknown as User;
      mockUserSearchService.findByEmail.mockResolvedValue(recoveryUser);
      mockCryptoService.compare.mockResolvedValue(true);
      mockSessionService.createSession.mockResolvedValue(mockSession);

      await login();

      expect(mockUserService.cleanPwdRecoveryState).toHaveBeenCalledWith(
        recoveryUser.id,
      );
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        recoveryUser,
        mockAgent,
        mockIp,
      );
    });
  });

  describe('createCookie', () => {
    it('should set the refresh_token cookie with security defaults', () => {
      const response = mockResponse as unknown as ExpressResponse;

      service.createCookie(response, 'refresh-token-value');

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token-value',
        {
          httpOnly: true,
          secure: false, // NODE_ENV is 'test' during jest runs
          sameSite: 'strict',
          path: '/',
          maxAge: REFRESH_TOKEN_DURATION,
        },
      );
    });

    it('should respect an explicit maxAge override', () => {
      const response = mockResponse as unknown as ExpressResponse;

      service.createCookie(response, 'refresh-token-value', 42_000);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token-value',
        expect.objectContaining({ maxAge: 42_000 }),
      );
    });
  });

  describe('refreshAuthentication', () => {
    it('should delegate to the session service with ip', async () => {
      mockSessionService.refreshSession.mockResolvedValue(mockSession);

      const result = await service.refreshAuthentication(
        'old-token',
        mockAgent,
        mockIp,
      );

      expect(mockSessionService.refreshSession).toHaveBeenCalledWith(
        'old-token',
        mockAgent,
        mockIp,
      );
      expect(result.token).toBe('jwt');
    });

    it('should delegate without ip so the session service can fall back', async () => {
      mockSessionService.refreshSession.mockResolvedValue(mockSession);

      await service.refreshAuthentication('old-token', mockAgent);

      expect(mockSessionService.refreshSession).toHaveBeenCalledWith(
        'old-token',
        mockAgent,
        undefined,
      );
    });
  });

  describe('logout', () => {
    it('should delegate to the session service', async () => {
      mockSessionService.logout.mockResolvedValue(undefined);

      await service.logout('refresh-token-value');

      expect(mockSessionService.logout).toHaveBeenCalledWith(
        'refresh-token-value',
      );
    });
  });
});