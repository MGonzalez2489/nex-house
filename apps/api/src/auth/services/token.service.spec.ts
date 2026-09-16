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

const RFC_UTC_STRING =
  /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/;

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
    const EMAIL = 'user@nexhouse.com';
    const USER_PUBLIC_ID = 'user-public-1';
    const SESSION_PUBLIC_ID = 'session-public-1';

    it('should sign an access token with email, sub and session claims and a 15-minute expiry', () => {
      const result = service.createAccessToken(
        EMAIL,
        USER_PUBLIC_ID,
        SESSION_PUBLIC_ID,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          email: EMAIL,
          sub: USER_PUBLIC_ID,
          session: SESSION_PUBLIC_ID,
        },
        expect.objectContaining({ expiresIn: ACCESS_TOKEN_DURATION / 1000 }),
      );
      expect(result.type).toBe('access');
      expect(result.token).toBe('signed-jwt');
    });

    it('should report expiration 15 minutes from now in both ms and UTC string form', () => {
      const before = Date.now();
      const result = service.createAccessToken(
        EMAIL,
        USER_PUBLIC_ID,
        SESSION_PUBLIC_ID,
      );
      const after = Date.now();

      expect(result.expiresInMs).toBeGreaterThanOrEqual(
        before + ACCESS_TOKEN_DURATION,
      );
      expect(result.expiresInMs).toBeLessThanOrEqual(
        after + ACCESS_TOKEN_DURATION,
      );
      expect(result.expiresAtDate).toBe(
        new Date(result.expiresInMs).toUTCString(),
      );
      expect(result.expiresAtDate).toMatch(RFC_UTC_STRING);
    });

    it('should pass empty or unusually shaped values straight into the JWT payload', () => {
      service.createAccessToken('', '', '');

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { email: '', sub: '', session: '' },
        expect.objectContaining({ expiresIn: ACCESS_TOKEN_DURATION / 1000 }),
      );
    });

    it('should always use the fixed ACCESS_TOKEN_DURATION regardless of the inputs', () => {
      service.createAccessToken(EMAIL, USER_PUBLIC_ID, SESSION_PUBLIC_ID);
      service.createAccessToken('', '', '');

      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.any(Object),
        expect.objectContaining({ expiresIn: ACCESS_TOKEN_DURATION / 1000 }),
      );
    });

    it('should propagate an error thrown by the JwtService', () => {
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('signing failed');
      });

      expect(() =>
        service.createAccessToken(EMAIL, USER_PUBLIC_ID, SESSION_PUBLIC_ID),
      ).toThrow('signing failed');
    });
  });

  describe('createRefreshAccessToken', () => {
    const USER_PUBLIC_ID = 'user-public-1';
    const SESSION_PUBLIC_ID = 'session-public-1';

    it('should sign a 7-day refresh token when rememberMe is false', () => {
      const result = service.createRefreshAccessToken(
        USER_PUBLIC_ID,
        SESSION_PUBLIC_ID,
        false,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: USER_PUBLIC_ID, session: SESSION_PUBLIC_ID },
        expect.objectContaining({ expiresIn: REFRESH_TOKEN_DURATION / 1000 }),
      );
      expect(result.type).toBe('refresh');
      expect(result.token).toBe('signed-jwt');
    });

    it('should extend the refresh token lifetime to 30 days when rememberMe is true', () => {
      const result = service.createRefreshAccessToken(
        USER_PUBLIC_ID,
        SESSION_PUBLIC_ID,
        true,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          expiresIn: REFRESH_TOKEN_REMEMBER_DURATION / 1000,
        }),
      );
      expect(result.type).toBe('refresh');
      expect(result.token).toBe('signed-jwt');
    });

    it('should embed only the sub and session claims (no email) in the payload', () => {
      service.createRefreshAccessToken(
        USER_PUBLIC_ID,
        SESSION_PUBLIC_ID,
        false,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: USER_PUBLIC_ID, session: SESSION_PUBLIC_ID },
        expect.any(Object),
      );
      expect(mockJwtService.sign.mock.calls[0][0]).not.toHaveProperty('email');
    });

    it('should report expiration 7 days from now when rememberMe is false', () => {
      const before = Date.now();
      const result = service.createRefreshAccessToken(
        USER_PUBLIC_ID,
        SESSION_PUBLIC_ID,
        false,
      );
      const after = Date.now();

      expect(result.expiresInMs).toBeGreaterThanOrEqual(
        before + REFRESH_TOKEN_DURATION,
      );
      expect(result.expiresInMs).toBeLessThanOrEqual(
        after + REFRESH_TOKEN_DURATION,
      );
      expect(result.expiresAtDate).toBe(
        new Date(result.expiresInMs).toUTCString(),
      );
    });

    it('should report expiration 30 days from now when rememberMe is true', () => {
      const before = Date.now();
      const result = service.createRefreshAccessToken(
        USER_PUBLIC_ID,
        SESSION_PUBLIC_ID,
        true,
      );
      const after = Date.now();

      expect(result.expiresInMs).toBeGreaterThanOrEqual(
        before + REFRESH_TOKEN_REMEMBER_DURATION,
      );
      expect(result.expiresInMs).toBeLessThanOrEqual(
        after + REFRESH_TOKEN_REMEMBER_DURATION,
      );
      expect(result.expiresAtDate).toBe(
        new Date(result.expiresInMs).toUTCString(),
      );
      expect(result.expiresAtDate).toMatch(RFC_UTC_STRING);
    });

    it('should propagate an error thrown by the JwtService', () => {
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('signing failed');
      });

      expect(() =>
        service.createRefreshAccessToken(
          USER_PUBLIC_ID,
          SESSION_PUBLIC_ID,
          false,
        ),
      ).toThrow('signing failed');
    });
  });

  describe('createResetPasswordToken', () => {
    const EMAIL = 'user@nexhouse.com';
    const USER_PUBLIC_ID = 'user-public-1';

    it('should sign a 5-minute reset token with the JWT_RESET secret and password_reset purpose', () => {
      const result = service.createResetPasswordToken(
        EMAIL,
        USER_PUBLIC_ID,
      );

      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_RESET');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          email: EMAIL,
          sub: USER_PUBLIC_ID,
          purpose: PWD_RESET_PURPOSE,
        },
        {
          secret: 'reset-secret',
          expiresIn: RESET_TOKEN_EXPIRATION / 1000,
        },
      );
      expect(result.type).toBe('reset_password');
      expect(result.token).toBe('signed-jwt');
    });

    it('should fall back to an empty secret when JWT_RESET is not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);

      service.createResetPasswordToken(EMAIL, USER_PUBLIC_ID);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ secret: '' }),
      );
    });

    it('should pass empty email and public id through to the token payload', () => {
      service.createResetPasswordToken('', '');

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { email: '', sub: '', purpose: PWD_RESET_PURPOSE },
        expect.objectContaining({ expiresIn: RESET_TOKEN_EXPIRATION / 1000 }),
      );
    });

    it('should report expiration 5 minutes from now in both ms and UTC string form', () => {
      const before = Date.now();
      const result = service.createResetPasswordToken(EMAIL, USER_PUBLIC_ID);
      const after = Date.now();

      expect(result.expiresInMs).toBeGreaterThanOrEqual(
        before + RESET_TOKEN_EXPIRATION,
      );
      expect(result.expiresInMs).toBeLessThanOrEqual(
        after + RESET_TOKEN_EXPIRATION,
      );
      expect(result.expiresAtDate).toBe(
        new Date(result.expiresInMs).toUTCString(),
      );
      expect(result.expiresAtDate).toMatch(RFC_UTC_STRING);
    });

    it('should propagate an error thrown by the JwtService', () => {
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('signing failed');
      });

      expect(() =>
        service.createResetPasswordToken(EMAIL, USER_PUBLIC_ID),
      ).toThrow('signing failed');
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

    it('should pass an empty token string straight through to the JwtService', () => {
      service.verifyToken('');

      expect(mockJwtService.verify).toHaveBeenCalledWith('');
    });

    it('should surface whatever the JwtService returns, including non-object results', () => {
      mockJwtService.verify.mockReturnValue('decoded-string' as never);

      expect(service.verifyToken('some.jwt')).toBe('decoded-string');
    });
  });
});