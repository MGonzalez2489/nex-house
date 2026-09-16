import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResetPwdGuard, ResetTokenPayload } from './reset-pwd.guard';
import { PWD_RESET_PURPOSE } from '@auth/constants';

type TestRequest = {
  headers: { authorization?: string };
  user?: ResetTokenPayload;
};

const buildContext = (authorization?: string): ExecutionContext => {
  const request: TestRequest = { headers: { authorization } };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

const requestOf = (context: ExecutionContext): TestRequest =>
  context.switchToHttp().getRequest() as TestRequest;

describe('ResetPwdGuard', () => {
  let guard: ResetPwdGuard;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const validPayload = {
    email: 'dev@nexhouse.com',
    sub: 'user-public-1',
    purpose: PWD_RESET_PURPOSE,
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

    await expect(guard.canActivate(buildContext('Bearer token'))).rejects.toThrow(
      new UnauthorizedException('Reset password secret is not configured'),
    );
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when no authorization header is present', async () => {
    await expect(guard.canActivate(buildContext(undefined))).rejects.toThrow(
      new UnauthorizedException('Token is required'),
    );
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should reject a malformed Authorization header with an empty token', async () => {
    await expect(guard.canActivate(buildContext('Bearer '))).rejects.toThrow(
      new UnauthorizedException('Token is required'),
    );
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should reject a non-Bearer authorization scheme without verifying anything', async () => {
    await expect(guard.canActivate(buildContext('Basic base64stuff'))).rejects.toThrow(
      new UnauthorizedException('Token is required'),
    );
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should reject a lowercase bearer scheme', async () => {
    await expect(guard.canActivate(buildContext('bearer token'))).rejects.toThrow(
      new UnauthorizedException('Token is required'),
    );
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should accept a valid password-reset token and inject the payload with the token', async () => {
    mockJwtService.verifyAsync.mockResolvedValue(validPayload);

    const context = buildContext('Bearer valid.jwt.token');
    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
      'valid.jwt.token',
      { secret: 'reset-secret' },
    );
    const user = requestOf(context).user;
    expect(user).toEqual({ ...validPayload, token: 'valid.jwt.token' });
  });

  it('should throw the specific message when the token purpose is not password_reset', async () => {
    mockJwtService.verifyAsync.mockResolvedValue({
      ...validPayload,
      purpose: 'access',
    });

    await expect(guard.canActivate(buildContext('Bearer stolen.login.jwt'))).rejects.toThrow(
      new UnauthorizedException('Token inválido para esta acción'),
    );
  });

  it('should throw the specific message when the payload lacks an email', async () => {
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-public-1',
      purpose: PWD_RESET_PURPOSE,
    });

    await expect(guard.canActivate(buildContext('Bearer incomplete.jwt'))).rejects.toThrow(
      new UnauthorizedException('Token inválido para esta acción'),
    );
  });

  it('should throw the verification message for a corrupt or expired token', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(buildContext('Bearer expired.jwt')),
    ).rejects.toThrow(new UnauthorizedException('Token expirado o corrupto'));
    expect(requestOf(buildContext('Bearer expired.jwt')).user).toBeUndefined();
  });
});