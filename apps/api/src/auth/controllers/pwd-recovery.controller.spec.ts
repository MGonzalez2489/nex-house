import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PwdRecoveryController } from './pwd-recovery.controller';
import { PwdRecoveryService } from '../services/pwd-recovery.service';
import { AuthService } from '../services/auth.service';

describe('PwdRecoveryController', () => {
  let controller: PwdRecoveryController;
  let mockRecoveryService: jest.Mocked<PwdRecoveryService>;
  let mockAuthService: jest.Mocked<AuthService>;

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
      const session = {
        token: 'session-jwt',
        refreshToken: 'refresh-jwt',
        exp: 12345,
        user: {} as never,
      };
      mockRecoveryService.updatePwd.mockResolvedValue(session);

      const request: any = {
        ip: '1.2.3.4',
        headers: { authorization: 'Bearer reset-jwt' },
      };
      const response: any = { cookie: jest.fn() };
      const user = {
        email: 'dev@nexhouse.com',
        sub: 'user-public-1',
        purpose: 'password_reset',
      };

      const result = await controller.updatePassword(
        { pwd: 'new-password' },
        request,
        user,
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

    it('should fall back to x-forwarded-for when request.ip is missing', async () => {
      mockRecoveryService.updatePwd.mockResolvedValue({
        token: 'session-jwt',
        refreshToken: 'refresh-jwt',
        exp: 12345,
        user: {} as never,
      });

      const request: any = {
        headers: {
          authorization: 'Bearer reset-jwt',
          'x-forwarded-for': '9.9.9.9',
        },
      };
      const response: any = { cookie: jest.fn() };

      await controller.updatePassword(
        { pwd: 'new-password' },
        request,
        { email: 'dev@nexhouse.com', sub: 's', purpose: 'password_reset' },
        'Mozilla/5.0',
        response,
      );

      expect(mockRecoveryService.updatePwd).toHaveBeenCalledWith(
        'dev@nexhouse.com',
        'new-password',
        'Mozilla/5.0',
        '9.9.9.9',
        'reset-jwt',
      );
    });
  });
});