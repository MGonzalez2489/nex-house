import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { NexHouseToken } from './token.service';
import { NxSession, User } from '@core/database';
import { CryptoService } from '@core/services';
import { TokenService } from './token.service';

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

  const buildAccessToken = (overrides: Partial<NexHouseToken> = {}) => {
    const expiresAt = Date.now() + 15 * 60 * 1000;
    return {
      type: 'access',
      token: 'mocked-access-token',
      expiresInMs: expiresAt,
      expiresAtDate: new Date(expiresAt).toUTCString(),
      ...overrides,
    };
  };

  const buildRefreshToken = (overrides: Partial<NexHouseToken> = {}) => {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return {
      type: 'refresh',
      token: 'mocked-refresh-token',
      expiresInMs: expiresAt,
      expiresAtDate: new Date(expiresAt).toUTCString(),
      ...overrides,
    };
  };

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
      verifyToken: jest.fn(),
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
        expect.any(String) as any,
        false,
      );
      expect(mockTokenService.createAccessToken).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.publicId,
        expect.any(String) as any,
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 42,
          browser: 'Chrome',
          os: 'Linux',
          device: 'Desktop',
          ipAddress: mockIp,
          refreshTokenHash: 'mocked-secure-hash',
          expiresAt: expect.any(String),
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
        expect.any(String) as any,
        true,
      );
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

    it('should throw UnauthorizedException when the session is missing or expired', async () => {
      mockTokenService.verifyToken.mockReturnValue({
        session: 'session-1',
        sub: mockUser.publicId,
      } as any);
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refreshSession('valid.refresh.token', mockUserAgent),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when the stored hash does not match', async () => {
      mockTokenService.verifyToken.mockReturnValue({
        session: 'session-1',
        sub: mockUser.publicId,
      } as any);
      mockRepository.findOne.mockResolvedValue({
        publicId: 'session-1',
        revoked: false,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        refreshTokenHash: 'stored-hash',
        socketId: undefined,
        ipAddress: mockIp,
        user: mockUser,
      } as NxSession);
      mockCryptoService.compare.mockResolvedValue(false);

      await expect(
        service.refreshSession('valid.refresh.token', mockUserAgent),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should mint a fresh session when the refresh token and stored hash are valid', async () => {
      mockTokenService.verifyToken.mockReturnValue({
        session: 'session-1',
        sub: mockUser.publicId,
      } as any);
      mockRepository.findOne.mockResolvedValue({
        publicId: 'session-1',
        revoked: false,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        refreshTokenHash: 'stored-hash',
        socketId: undefined,
        ipAddress: mockIp,
        user: mockUser,
      } as NxSession);
      mockCryptoService.compare.mockResolvedValue(true);

      const result = await service.refreshSession(
        'valid.refresh.token',
        mockUserAgent,
      );

      expect(result.token).toBe('mocked-access-token');
      expect(mockTokenService.createRefreshAccessToken).toHaveBeenCalledWith(
        mockUser.publicId,
        expect.any(String) as any,
        true,
      );
    });
  });

  describe('logout', () => {
    it('should revoke the session matching the token payload', async () => {
      mockTokenService.verifyToken.mockReturnValue({
        session: 'session-1',
      } as any);
      mockRepository.update.mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.logout('valid.refresh.token');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { publicId: 'session-1' },
        expect.objectContaining({ revoked: true }),
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