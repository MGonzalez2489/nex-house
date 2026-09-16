import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserSearchService } from '@administration/user/services';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let userSearchService: UserSearchService;

  const EXPECTED_RELATIONS = { neighborhood: true, role: true, status: true };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'testSecret';
      }
      return undefined;
    }),
  };

  const mockUserSearchService = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockClear();
    mockUserSearchService.findByEmail.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserSearchService,
          useValue: mockUserSearchService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
    userSearchService = module.get<UserSearchService>(UserSearchService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should configure JwtStrategy with the JWT_SECRET', () => {
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  describe('validate', () => {
    const payload = { sub: '1', email: 'test@example.com', session: 's-1' };

    it('should return the user if found by UserSearchService', async () => {
      const user = { id: 1, email: 'test@example.com', name: 'Test User' };
      mockUserSearchService.findByEmail.mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(userSearchService.findByEmail).toHaveBeenCalledWith(
        payload.email,
        undefined,
        EXPECTED_RELATIONS,
      );
      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException if user is not found by UserSearchService', async () => {
      mockUserSearchService.findByEmail.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userSearchService.findByEmail).toHaveBeenCalledWith(
        payload.email,
        undefined,
        EXPECTED_RELATIONS,
      );
    });

    it('should throw UnauthorizedException without querying when the email claim is missing', async () => {
      await expect(
        strategy.validate(
          { sub: 1 } as unknown as Parameters<typeof strategy.validate>[0],
        ),
      ).rejects.toThrow(new UnauthorizedException('jwt:Invalid token payload'));
      expect(userSearchService.findByEmail).not.toHaveBeenCalled();
    });
  });
});