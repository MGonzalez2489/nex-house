import {
  REFRESH_TOKEN_DURATION,
  REFRESH_TOKEN_REMEMBER_DURATION,
} from '@auth/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { SessionService } from './session.service';
import { NexHouseToken } from './token.service';
import { NxSession, User } from '@core/database';
import { CryptoService } from '@core/services';
import { TokenService } from './token.service';

interface RefreshTokenPayload {
  session: string;
  sub: string;
  iat?: number;
  exp?: number;
}

describe('SessionService', () => {
  let service: SessionService;
  let mockRepository: jest.Mocked<Repository<NxSession>>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockCryptoService: jest.Mocked<CryptoService>;

  const mockUser = {
    id: 42,
    publicId: 'user-uuid-abc',
    email: 'manuel@nexhouse.com',
  } as User;

  const mockUserAgent =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const mockIp = '192.168.1.25';

  const SEVEN_DAYS_SECONDS = REFRESH_TOKEN_DURATION / 1000;
  const THIRTY_DAYS_SECONDS = REFRESH_TOKEN_REMEMBER_DURATION / 1000;

  const buildAccessToken = (
    overrides: Partial<NexHouseToken> = {},
  ): NexHouseToken => {
    const expiresAt = Date.now() + 15 * 60 * 1000;
    return {
      type: 'access',
      token: 'mocked-access-token',
      expiresInMs: expiresAt,
      expiresAtDate: new Date(expiresAt).toUTCString(),
      ...overrides,
    };
  };

  const buildRefreshToken = (
    overrides: Partial<NexHouseToken> = {},
  ): NexHouseToken => {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return {
      type: 'refresh',
      token: 'mocked-refresh-token',
      expiresInMs: expiresAt,
      expiresAtDate: new Date(expiresAt).toUTCString(),
      ...overrides,
    };
  };

  const buildTokenPayload = (
    session: string,
    sub: string,
    rememberMe: boolean,
  ): RefreshTokenPayload => {
    const iat = 1_700_000_000;
    const exp = iat + (rememberMe ? THIRTY_DAYS_SECONDS : SEVEN_DAYS_SECONDS);
    return { session, sub, iat, exp };
  };

  const buildSession = (overrides: Partial<NxSession> = {}) =>
    ({
      publicId: 'session-1',
      revoked: false,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      refreshTokenHash: 'stored-hash',
      socketId: undefined,
      ipAddress: mockIp,
      user: mockUser,
      ...overrides,
    }) as NxSession;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Repository<NxSession>>;

    mockTokenService = {
      createAccessToken: jest.fn().mockImplementation(() => buildAccessToken()),
      createRefreshAccessToken: jest
        .fn()
        .mockImplementation(() => buildRefreshToken()),
      verifyToken: jest.fn().mockReturnValue({}),
    } as unknown as jest.Mocked<TokenService>;

    mockCryptoService = {
      hash: jest.fn().mockResolvedValue('mocked-secure-hash'),
      compare: jest.fn(),
    } as unknown as jest.Mocked<CryptoService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: getRepositoryToken(NxSession), useValue: mockRepository },
        { provide: TokenService, useValue: mockTokenService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should build a standard 7-day session when rememberMe is false', async () => {
      const result = await service.createSession(
        mockUser,
        mockUserAgent,
        mockIp,
        false,
      );

      expect(mockTokenService.createRefreshAccessToken).toHaveBeenCalledWith(
        mockUser.publicId,
        expect.any(String),
        false,
      );
      expect(mockTokenService.createAccessToken).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.publicId,
        expect.any(String),
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 42,
          browser: 'Chrome',
          os: 'Linux',
          device: 'Desktop',
          ipAddress: mockIp,
          refreshTokenHash: 'mocked-secure-hash',
          expiresAt: expect.any(Date),
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        user: expect.anything(),
        token: 'mocked-access-token',
        refreshToken: 'mocked-refresh-token',
        exp: expect.any(Number),
      });
    });

    it('should pass rememberMe=true through to the token service', async () => {
      await service.createSession(mockUser, mockUserAgent, mockIp, true);

      expect(mockTokenService.createRefreshAccessToken).toHaveBeenCalledWith(
        mockUser.publicId,
        expect.any(String),
        true,
      );
    });

    it('should store expiresAt as a Date matching the refresh token expiration', async () => {
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      mockTokenService.createRefreshAccessToken
        .mockReturnValueOnce(buildRefreshToken({ expiresInMs: expiresAt }))
        .mockReturnValue(buildRefreshToken());

      await service.createSession(mockUser, mockUserAgent, mockIp, false);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      );
      const created = mockRepository.create.mock.calls[0][0] as NxSession;
      expect(created.expiresAt.getTime()).toBe(expiresAt);
    });

    it('should fallback device definitions to Desktop if parser yields undefined models', async () => {
      const genericAgent = 'PostmanRuntime/7.32.3';
      await service.createSession(mockUser, genericAgent, mockIp);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          device: 'Desktop',
        }),
      );
    });

    it('should attach an existing socket id to the new session', async () => {
      await service.createSession(
        mockUser,
        mockUserAgent,
        mockIp,
        false,
        'socket-abc',
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          socketId: 'socket-abc',
        }),
      );
    });
  });

  describe('refreshSession', () => {
    it('should throw UnauthorizedException when the refresh token is invalid', async () => {
      mockTokenService.verifyToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        service.refreshSession('expired.refresh.token', mockUserAgent),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the session is missing', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refreshSession('valid.refresh.token', mockUserAgent),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when the stored session is already expired', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(
        buildSession({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(
        service.refreshSession('valid.refresh.token', mockUserAgent),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when the token subject does not match the session user', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', 'another-public-id', false),
      );
      mockRepository.findOne.mockResolvedValue(buildSession());

      await expect(
        service.refreshSession('valid.refresh.token', mockUserAgent),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the session has no user relation', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(buildSession({ user: null }));

      await expect(
        service.refreshSession('valid.refresh.token', mockUserAgent),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when the stored hash does not match', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(buildSession());
      mockCryptoService.compare.mockResolvedValue(false);

      await expect(
        service.refreshSession('valid.refresh.token', mockUserAgent),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should mint a fresh 7-day session when the presented token is 7 days old', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(buildSession());
      mockCryptoService.compare.mockResolvedValue(true);

      const result = await service.refreshSession(
        'valid.refresh.token',
        mockUserAgent,
      );

      expect(result.token).toBe('mocked-access-token');
      expect(mockTokenService.createRefreshAccessToken).toHaveBeenCalledWith(
        mockUser.publicId,
        expect.any(String),
        false,
      );
    });

    it('should mint a fresh 30-day session when the presented token was created with rememberMe', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, true),
      );
      mockRepository.findOne.mockResolvedValue(buildSession());
      mockCryptoService.compare.mockResolvedValue(true);

      const result = await service.refreshSession(
        'valid.refresh.token',
        mockUserAgent,
      );

      expect(result.token).toBe('mocked-access-token');
      expect(mockTokenService.createRefreshAccessToken).toHaveBeenCalledWith(
        mockUser.publicId,
        expect.any(String),
        true,
      );
    });

    it('should default to a 7-day session when the token has no iat/exp claims', async () => {
      mockTokenService.verifyToken.mockReturnValue({
        session: 'session-1',
        sub: mockUser.publicId,
      });
      mockRepository.findOne.mockResolvedValue(buildSession());
      mockCryptoService.compare.mockResolvedValue(true);

      await service.refreshSession('valid.refresh.token', mockUserAgent);

      expect(mockTokenService.createRefreshAccessToken).toHaveBeenCalledWith(
        mockUser.publicId,
        expect.any(String),
        false,
      );
    });

    it('should record the current request IP on the rotated session when provided', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(buildSession());
      mockCryptoService.compare.mockResolvedValue(true);

      await service.refreshSession(
        'valid.refresh.token',
        mockUserAgent,
        '203.0.113.9',
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: '203.0.113.9' }),
      );
    });

    it('should fall back to the stored session IP when no current IP is provided', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(buildSession());
      mockCryptoService.compare.mockResolvedValue(true);

      await service.refreshSession('valid.refresh.token', mockUserAgent);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: mockIp }),
      );
    });

    it('should rotate the session and revoke the previously presented token', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(buildSession());
      mockCryptoService.compare.mockResolvedValue(true);

      await service.refreshSession('valid.refresh.token', mockUserAgent);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { publicId: 'session-1' },
        expect.objectContaining({ revoked: true }),
      );
    });

    it('should carry the existing socket id over to the rotated session', async () => {
      mockTokenService.verifyToken.mockReturnValue(
        buildTokenPayload('session-1', mockUser.publicId, false),
      );
      mockRepository.findOne.mockResolvedValue(
        buildSession({ socketId: 'socket-abc' }),
      );
      mockCryptoService.compare.mockResolvedValue(true);

      await service.refreshSession('valid.refresh.token', mockUserAgent);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ socketId: 'socket-abc' }),
      );
    });
  });

  describe('logout', () => {
    it('should revoke the session, clear the socket and stamp the last activity', async () => {
      mockTokenService.verifyToken.mockReturnValue({
        session: 'session-1',
      } as RefreshTokenPayload);
      mockRepository.update.mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.logout('valid.refresh.token');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { publicId: 'session-1' },
        expect.objectContaining({
          revoked: true,
          socketId: null,
          lastActivity: expect.any(Date),
        }),
      );
    });

    it('should swallow errors from invalid or expired tokens', async () => {
      mockTokenService.verifyToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        service.logout('expired.refresh.token'),
      ).resolves.toBeUndefined();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});