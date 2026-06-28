import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
import { NxSession, User } from '@core/database';
import { CryptoService } from '@core/services';

describe('SessionService', () => {
  let service: SessionService;
  let mockRepository: jest.Mocked<Repository<NxSession>>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockCryptoService: jest.Mocked<CryptoService>;

  const mockUser = {
    id: 42,
    publicId: 'user-uuid-abc',
    email: 'manuel@nexhouse.com',
  } as User;

  const mockUserAgent =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const mockIp = '192.168.1.25';

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    } as unknown as jest.Mocked<Repository<NxSession>>;

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    } as unknown as jest.Mocked<JwtService>;

    mockCryptoService = {
      hash: jest.fn().mockResolvedValue('mocked-secure-hash'),
    } as unknown as jest.Mocked<CryptoService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: getRepositoryToken(NxSession), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a standard 7-day session when rememberMe is false', async () => {
    const result = await service.createSession(
      mockUser,
      mockUserAgent,
      mockIp,
      false,
    );

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 42,
        browser: 'Chrome',
        os: 'Linux',
        device: 'Desktop',
        ipAddress: mockIp,
        refreshTokenHash: 'mocked-secure-hash',
      }),
    );

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockJwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'user-uuid-abc' }),
      expect.objectContaining({ expiresIn: '7d' }),
    );

    expect(result).toEqual({
      token: 'mocked-jwt-token',
      refreshToken: 'mocked-jwt-token',
      exp: expect.any(Number),
    });
  });

  it('should extend lifecycles to 30 days when rememberMe parameter is true', async () => {
    await service.createSession(mockUser, mockUserAgent, mockIp, true);

    expect(mockJwtService.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: '30d' }),
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
