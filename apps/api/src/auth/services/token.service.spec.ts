import {
  ACCESS_TOKEN_DURATION,
  PWD_RESET_PURPOSE,
  REFRESH_TOKEN_DURATION,
  REFRESH_TOKEN_REMEMBER_DURATION,
  RESET_TOKEN_EXPIRATION,
} from '@auth/constants';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt'),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockConfigService = {
      get: jest.fn().mockReturnValue('reset-secret'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccessToken', () => {
    it('should sign an access token with email, sub and session claims and a 15-minute expiry', () => {
      const result = service.createAccessToken(
        'user@nexhouse.com',
        'user-public-1',
        'session-public-1',
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          email: 'user@nexhouse.com',
          sub: 'user-public-1',
          session: 'session-public-1',
        },
        expect.objectContaining({ expiresIn: '15m' }),
      );
      expect(result.type).toBe('access');
      expect(result.token).toBe('signed-jwt');
    });

    it('should report expiration 15 minutes from now in both ms and UTC string form', () => {
      const before = Date.now();
      const result = service.createAccessToken(
        'user@nexhouse.com',
        'user-public-1',
        'session-public-1',
      );
      const after = Date.now();

      expect(result.expiresInMs).toBeGreaterThanOrEqual(
        before + ACCESS_TOKEN_DURATION,
      );
      expect(result.expiresInMs).toBeLessThanOrEqual(
        after + ACCESS_TOKEN_DURATION,
      );
      expect(new Date(result.expiresInMs).toUTCString()).toBe(
        result.expiresAtDate,
      );
    });
  });

  describe('createRefreshAccessToken', () => {
    it('should sign a 7-day refresh token when rememberMe is false', () => {
      const result = service.createRefreshAccessToken(
        'user-public-1',
        'session-public-1',
        false,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-public-1', session: 'session-public-1' },
        expect.objectContaining({ expiresIn: '7d' }),
      );
      expect(result.type).toBe('refresh');
      expect(result.token).toBe('signed-jwt');
      expect(result.expiresInMs).toBeGreaterThanOrEqual(
        Date.now() + REFRESH_TOKEN_DURATION - 100,
      );
    });

    it('should extend the refresh token lifetime to 30 days when rememberMe is true', () => {
      const result = service.createRefreshAccessToken(
        'user-public-1',
        'session-public-1',
        true,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: '30d' }),
      );
      expect(result.expiresInMs).toBeGreaterThanOrEqual(
        Date.now() + REFRESH_TOKEN_REMEMBER_DURATION - 100,
      );
    });
  });

  describe('createResetPasswordToken', () => {
    it('should sign a password-reset token with the JWT_RESET secret and password_reset purpose', () => {
      const result = service.createResetPasswordToken(
        'user@nexhouse.com',
        'user-public-1',
      );

      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_RESET');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          email: 'user@nexhouse.com',
          sub: 'user-public-1',
          purpose: PWD_RESET_PURPOSE,
        },
        {
          secret: 'reset-secret',
          expiresIn: '5m',
        },
      );
      expect(result.type).toBe('reset_password');
      expect(result.token).toBe('signed-jwt');
      expect(result.expiresInMs).toBeGreaterThanOrEqual(
        Date.now() + RESET_TOKEN_EXPIRATION - 100,
      );
    });

    it('should fall back to an empty secret when JWT_RESET is not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);

      service.createResetPasswordToken('user@nexhouse.com', 'user-public-1');

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ secret: '' }),
      );
    });
  });

  describe('verifyToken', () => {
    it('should delegate validation to the JwtService and return the decoded payload', () => {
      const payload = { sub: 'user-public-1', session: 'session-public-1' };
      mockJwtService.verify.mockReturnValue(payload as never);

      expect(service.verifyToken('valid.jwt.token')).toBe(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid.jwt.token');
    });

    it('should propagate the error when the token is invalid or expired', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => service.verifyToken('expired.jwt.token')).toThrow(
        'jwt expired',
      );
    });
  });
});