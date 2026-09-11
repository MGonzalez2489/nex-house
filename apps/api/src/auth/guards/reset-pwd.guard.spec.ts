import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResetPwdGuard } from './reset-pwd.guard';
import { PWD_RESET_PURPOSE } from '../pwd-recovery.constants';

describe('ResetPwdGuard', () => {
  let guard: ResetPwdGuard;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const validPayload = {
    email: 'dev@nexhouse.com',
    sub: 'user-public-1',
    purpose: PWD_RESET_PURPOSE,
  };

  const buildContext = (authorization?: string) => {
    const request = { headers: { authorization } };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as any;
  };

  beforeEach(() => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;
    mockConfigService = {
      get: jest.fn().mockReturnValue('reset-secret'),
    } as unknown as jest.Mocked<ConfigService>;

    guard = new ResetPwdGuard(mockJwtService, mockConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when the reset secret is not configured', async () => {
    mockConfigService.get.mockReturnValue(undefined);

    await expect(
      guard.canActivate(buildContext('Bearer token')),
    ).rejects.toThrow(new UnauthorizedException('Reset password secret is not configured'));
  });

  it('should throw UnauthorizedException when no authorization header is present', async () => {
    await expect(guard.canActivate(buildContext(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should accept a valid password-reset token and inject the payload', async () => {
    mockJwtService.verifyAsync.mockResolvedValue(validPayload);

    const context = buildContext('Bearer valid.jwt.token');
    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
      'valid.jwt.token',
      { secret: 'reset-secret' },
    );
    expect(context.switchToHttp().getRequest().user).toEqual(validPayload);
  });

  it('should throw UnauthorizedException when the token purpose is not password_reset', async () => {
    mockJwtService.verifyAsync.mockResolvedValue({
      ...validPayload,
      purpose: 'access',
    });

    await expect(
      guard.canActivate(buildContext('Bearer stolen.login.jwt')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the payload lacks an email', async () => {
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-public-1',
      purpose: PWD_RESET_PURPOSE,
    });

    await expect(
      guard.canActivate(buildContext('Bearer incomplete.jwt')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the token is expired or malformed', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(buildContext('Bearer expired.jwt')),
    ).rejects.toThrow(new UnauthorizedException('Token expirado o corrupto'));
  });
});