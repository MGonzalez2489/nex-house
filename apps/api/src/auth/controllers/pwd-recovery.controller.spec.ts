import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { PwdRecoveryController } from './pwd-recovery.controller';
import { PwdRecoveryService } from '../services/pwd-recovery.service';
import { AuthService } from '../services/auth.service';
import { ResetTokenPayload } from '@auth/guards';

type TestRequest = {
  ip?: string;
  headers: Record<string, unknown>;
};

describe('PwdRecoveryController', () => {
  let controller: PwdRecoveryController;
  let mockRecoveryService: jest.Mocked<PwdRecoveryService>;
  let mockAuthService: jest.Mocked<AuthService>;

  const session = {
    token: 'session-jwt',
    refreshToken: 'refresh-jwt',
    exp: 12345,
    user: {} as never,
  };

  const resetUser: ResetTokenPayload = {
    email: 'dev@nexhouse.com',
    sub: 'user-public-1',
    purpose: 'password_reset',
    token: 'reset-jwt',
  };

  const buildRequest = (overrides: {
    ip?: string;
    'x-forwarded-for'?: string;
  } = {}): ExpressRequest => {
    const request: TestRequest = {
      ip: overrides.ip,
      headers:
        overrides['x-forwarded-for'] !== undefined
          ? { 'x-forwarded-for': overrides['x-forwarded-for'] }
          : {},
    };
    return request as unknown as ExpressRequest;
  };

  const buildResponse = (): ExpressResponse =>
    ({ cookie: jest.fn() }) as unknown as ExpressResponse;

  beforeEach(async () => {
    mockRecoveryService = {
      createRecoveryCode: jest.fn(),
      validateCode: jest.fn(),
      updatePwd: jest.fn(),
    } as unknown as jest.Mocked<PwdRecoveryService>;

    mockAuthService = {
      createCookie: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PwdRecoveryController],
      providers: [
        { provide: PwdRecoveryService, useValue: mockRecoveryService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<PwdRecoveryController>(PwdRecoveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('pwdRecoveryRequest', () => {
    it('should delegate the email to the recovery service', async () => {
      mockRecoveryService.createRecoveryCode.mockResolvedValue({
        code: 'ABC-123456',
      });

      const result = await controller.pwdRecoveryRequest({
        email: 'dev@nexhouse.com',
      });

      expect(mockRecoveryService.createRecoveryCode).toHaveBeenCalledWith(
        'dev@nexhouse.com',
      );
      expect(result.code).toBe('ABC-123456');
    });
  });

  describe('codeValidation', () => {
    it('should delegate the code to the recovery service', async () => {
      mockRecoveryService.validateCode.mockResolvedValue({
        token: 'reset-jwt',
        exp: 12345,
      });

      const result = await controller.codeValidation({
        code: 'ABC-123456',
      });

      expect(mockRecoveryService.validateCode).toHaveBeenCalledWith(
        'ABC-123456',
      );
      expect(result.token).toBe('reset-jwt');
    });
  });

  describe('updatePassword', () => {
    it('should update the password, set the auth cookie and return the session', async () => {
      mockRecoveryService.updatePwd.mockResolvedValue(session);

      const request = buildRequest({ ip: '1.2.3.4' });
      const response = buildResponse();

      const result = await controller.updatePassword(
        { pwd: 'new-password' },
        request,
        resetUser,
        'Mozilla/5.0',
        response,
      );

      expect(mockRecoveryService.updatePwd).toHaveBeenCalledWith(
        'dev@nexhouse.com',
        'new-password',
        'Mozilla/5.0',
        '1.2.3.4',
        'reset-jwt',
      );
      expect(mockAuthService.createCookie).toHaveBeenCalledWith(
        response,
        'refresh-jwt',
      );
      expect(result).toBe(session);
    });

    it('should fall back to the first X-Forwarded-For entry when request.ip is missing', async () => {
      mockRecoveryService.updatePwd.mockResolvedValue(session);

      const request = buildRequest({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' });

      await controller.updatePassword(
        { pwd: 'new-password' },
        request,
        resetUser,
        'Mozilla/5.0',
        buildResponse(),
      );

      expect(mockRecoveryService.updatePwd).toHaveBeenCalledWith(
        'dev@nexhouse.com',
        'new-password',
        'Mozilla/5.0',
        '9.9.9.9',
        'reset-jwt',
      );
    });

    it('should fall back to 0.0.0.0 when no ip source is available', async () => {
      mockRecoveryService.updatePwd.mockResolvedValue(session);

      const request = buildRequest();

      await controller.updatePassword(
        { pwd: 'new-password' },
        request,
        resetUser,
        'Mozilla/5.0',
        buildResponse(),
      );

      expect(mockRecoveryService.updatePwd).toHaveBeenCalledWith(
        'dev@nexhouse.com',
        'new-password',
        'Mozilla/5.0',
        '0.0.0.0',
        'reset-jwt',
      );
    });
  });
});