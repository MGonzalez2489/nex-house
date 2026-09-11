import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserSearchService, UserService } from '@administration/user/services';
import { User } from '@core/database';
import { UserRoleEnum, UserStatusEnum } from '@nexhouse/shared-domain/enums';
import { SessionService } from './session.service';
import { PwdRecoveryService } from './pwd-recovery.service';
import { TokenService } from './token.service';

describe('PwdRecoveryService', () => {
  let service: PwdRecoveryService;
  let mockUserSearchService: jest.Mocked<UserSearchService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockSessionService: jest.Mocked<SessionService>;

  const baseMockUser = {
    id: 1,
    publicId: 'user-public-1',
    email: 'dev@nexhouse.com',
    neighborhoodId: 10,
    recoveryCode: 'ABC-123456',
    recoveryCodeExpiration: new Date(Date.now() + 60 * 60 * 1000).toUTCString(),
    recoveryToken: 'reset-token-xyz',
    role: { name: UserRoleEnum.RESIDENT },
    status: { name: UserStatusEnum.PASSWORD_RECOVERY },
    neighborhood: { id: 10, isActive: true },
  } as unknown as User;

  const mockActiveUser = {
    ...baseMockUser,
    status: { name: UserStatusEnum.ACTIVE },
  } as unknown as User;

  beforeEach(async () => {
    mockUserSearchService = {
      findByEmailOrThrow: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<UserSearchService>;

    mockUserService = {
      update: jest.fn(),
      updatePasswordOnRecoveryProcess: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    mockTokenService = {
      createResetPasswordToken: jest.fn().mockReturnValue({
        type: 'reset_password',
        token: 'mocked-reset-jwt',
        expiresInMs: Date.now() + 5 * 60 * 1000,
        expiresAtDate: new Date(Date.now() + 5 * 60 * 1000).toUTCString(),
      }),
    } as unknown as jest.Mocked<TokenService>;

    mockSessionService = {
      createSession: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PwdRecoveryService,
        { provide: UserSearchService, useValue: mockUserSearchService },
        { provide: UserService, useValue: mockUserService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compile();

    service = module.get<PwdRecoveryService>(PwdRecoveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecoveryCode', () => {
    it('should generate a recovery code, persist it and return the code in non-prod environments', async () => {
      mockUserSearchService.findByEmailOrThrow.mockResolvedValue(
        baseMockUser,
      );

      const result = await service.createRecoveryCode(baseMockUser.email);

      expect(mockUserSearchService.findByEmailOrThrow).toHaveBeenCalledWith(
        baseMockUser.email,
        undefined,
        { neighborhood: true, status: true, role: true },
      );
      expect(mockUserService.update).toHaveBeenCalledTimes(1);
      const [, , updateDto] = mockUserService.update.mock.calls[0];
      expect(updateDto.recoveryCode).toMatch(/^[A-Z]{3}-\d{6}$/);
      expect(updateDto.recoveryCodeExpiration).toBeDefined();
      expect(result.code).toMatch(/^[A-Z]{3}-\d{6}$/);
    });

    it('should throw ForbiddenException for an inactive neighborhood of a non-superadmin user', async () => {
      const inactiveNeighborhoodUser = {
        ...baseMockUser,
        neighborhood: { id: 10, isActive: false },
      } as unknown as User;
      mockUserSearchService.findByEmailOrThrow.mockResolvedValue(
        inactiveNeighborhoodUser,
      );

      await expect(
        service.createRecoveryCode(baseMockUser.email),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUserService.update).not.toHaveBeenCalled();
    });

    it('should allow a SUPERADMIN without an active neighborhood', async () => {
      const superAdmin = {
        ...baseMockUser,
        role: { name: UserRoleEnum.SUPERADMIN },
        neighborhood: null,
      } as unknown as User;
      mockUserSearchService.findByEmailOrThrow.mockResolvedValue(superAdmin);

      const result = await service.createRecoveryCode(superAdmin.email);

      expect(mockUserService.update).toHaveBeenCalledTimes(1);
      expect(result.code).toMatch(/^[A-Z]{3}-\d{6}$/);
    });

    it('should throw ForbiddenException when the user is INACTIVE', async () => {
      const inactiveUser = {
        ...baseMockUser,
        status: { name: UserStatusEnum.INACTIVE },
      } as unknown as User;
      mockUserSearchService.findByEmailOrThrow.mockResolvedValue(inactiveUser);

      await expect(
        service.createRecoveryCode(baseMockUser.email),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUserService.update).not.toHaveBeenCalled();
    });
  });

  describe('validateCode', () => {
    it('should throw BadRequestException when no user holds the code', async () => {
      mockUserSearchService.findOne.mockResolvedValue(null);

      await expect(service.validateCode('ZZZ-000000')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTokenService.createResetPasswordToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the recovery code has expired', async () => {
      const expiredUser = {
        ...baseMockUser,
        recoveryCodeExpiration: '2020-01-01T00:00:00.000Z',
      } as unknown as User;
      mockUserSearchService.findOne.mockResolvedValue(expiredUser);

      await expect(service.validateCode('ABC-123456')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTokenService.createResetPasswordToken).not.toHaveBeenCalled();
    });

    it('should create a purpose-limited reset token and persist it', async () => {
      mockUserSearchService.findOne.mockResolvedValue(baseMockUser);

      const result = await service.validateCode('ABC-123456');

      expect(mockTokenService.createResetPasswordToken).toHaveBeenCalledWith(
        baseMockUser.email,
        baseMockUser.publicId,
      );
      expect(mockUserService.update).toHaveBeenCalledWith(
        baseMockUser.neighborhoodId,
        baseMockUser.publicId,
        { recoveryToken: 'mocked-reset-jwt' },
        baseMockUser,
      );
      expect(result.token).toBe('mocked-reset-jwt');
      expect(result.exp).toBe(expect.any(Number));
      expect(result.exp).toBeGreaterThan(Date.now());
    });
  });

  describe('updatePwd', () => {
    it('should throw BadRequestException when the user status is not PASSWORD_RECOVERY', async () => {
      mockUserSearchService.findByEmailOrThrow.mockResolvedValue(
        mockActiveUser,
      );

      await expect(
        service.updatePwd(
          baseMockUser.email,
          'new-password',
          'user-agent',
          '1.2.3.4',
          'reset-token-xyz',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when recovery info is incomplete', async () => {
      const incompleteUser = {
        ...baseMockUser,
        recoveryCode: null,
        recoveryToken: null,
      } as unknown as User;
      mockUserSearchService.findByEmailOrThrow.mockResolvedValue(
        incompleteUser,
      );

      await expect(
        service.updatePwd(
          baseMockUser.email,
          'new-password',
          'user-agent',
          '1.2.3.4',
          'reset-token-xyz',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when the presented token does not match the stored one', async () => {
      mockUserSearchService.findByEmailOrThrow.mockResolvedValue(baseMockUser);

      await expect(
        service.updatePwd(
          baseMockUser.email,
          'new-password',
          'user-agent',
          '1.2.3.4',
          'stolen-or-forged-token',
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(
        mockUserService.updatePasswordOnRecoveryProcess,
      ).not.toHaveBeenCalled();
    });

    it('should update the password, clear recovery fields and create a session on success', async () => {
      mockUserSearchService.findByEmailOrThrow.mockResolvedValue(baseMockUser);
      mockSessionService.createSession.mockResolvedValue({
        token: 'session-jwt',
        refreshToken: 'refresh-jwt',
        exp: 12345,
        user: {} as never,
      });

      const result = await service.updatePwd(
        baseMockUser.email,
        'new-password',
        'user-agent',
        '1.2.3.4',
        'reset-token-xyz',
      );

      expect(
        mockUserService.updatePasswordOnRecoveryProcess,
      ).toHaveBeenCalledWith(baseMockUser.id, 'new-password');
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        baseMockUser,
        'user-agent',
        '1.2.3.4',
      );
      expect(result.token).toBe('session-jwt');
    });
  });

  describe('generateRecoveryCode', () => {
    it('should generate codes matching the AAA-###### format', () => {
      for (let i = 0; i < 50; i++) {
        const code = service.generateRecoveryCode();
        expect(code).toMatch(/^[A-Z]{3}-\d{6}$/);
      }
    });
  });
});