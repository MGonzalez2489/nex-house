import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserSearchService } from '@administration/user/services';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let userSearchService: UserSearchService;

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

  it('should configure JwtStrategy with correct secret', () => {
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  describe('validate', () => {
    it('should return the user if found by UserSearchService', async () => {
      const payload = { sub: 1, email: 'test@example.com', role: 'admin' };
      const user = { id: 1, email: 'test@example.com', name: 'Test User' };
      mockUserSearchService.findByEmail.mockResolvedValue(user.email);

      const result = await strategy.validate(payload);

      expect(userSearchService.findByEmail).toHaveBeenCalledWith(
        payload.email,
        undefined,
        { neighborhood: true },
      );
      expect(result).toEqual(user.email);
    });

    it('should throw UnauthorizedException if user is not found by UserSearchService', async () => {
      const payload = { sub: 1, email: 'test@example.com', role: 'admin' };
      mockUserSearchService.findByEmail.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userSearchService.findByEmail).toHaveBeenCalledWith(
        payload.email,
        undefined,
        { neighborhood: true },
      );
    });
  });
});
