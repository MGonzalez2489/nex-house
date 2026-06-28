import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSearchService } from '@administration/user/services';
import { User } from '@core/database';
import { CryptoService } from '@core/services';
import { UserRoleEnum, UserStatusEnum } from '@nexhouse/shared-domain/enums';
import { LoginDto } from '../dtos';
import { SessionService } from './session.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserSearchService: jest.Mocked<UserSearchService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockCryptoService: jest.Mocked<CryptoService>;

  const mockLoginDto: LoginDto = {
    email: 'dev@nexhouse.com',
    password: 'securePassword123',
  };
  const mockIp = '127.0.0.1';
  const mockAgent = 'Chrome';

  const baseMockUser = {
    id: 1,
    email: 'dev@nexhouse.com',
    password: 'hashed-password-string',
    role: { name: UserRoleEnum.RESIDENT },
    status: { name: UserStatusEnum.ACTIVE },
    neighborhood: { id: 10, isActive: true },
  } as unknown as User;

  beforeEach(async () => {
    mockUserSearchService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserSearchService>;
    mockSessionService = {
      createSession: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;
    mockCryptoService = {
      compare: jest.fn(),
    } as unknown as jest.Mocked<CryptoService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserSearchService, useValue: mockUserSearchService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should authorize and dispatch a new session under a valid user profile workflow', async () => {
    mockUserSearchService.findByEmail.mockResolvedValue(baseMockUser);
    mockCryptoService.compare.mockResolvedValue(true);
    mockSessionService.createSession.mockResolvedValue({
      token: 'jwt',
      refreshToken: 'rt',
      exp: 123,
    });

    const result = await service.login(mockLoginDto, mockAgent, mockIp);

    expect(mockCryptoService.compare).toHaveBeenCalledWith(
      mockLoginDto.password,
      baseMockUser.password,
    );
    expect(mockSessionService.createSession).toHaveBeenCalledWith(
      baseMockUser,
      mockAgent,
      mockIp,
    );
    expect(result.token).toBe('jwt');
  });

  it('should throw UnauthorizedException if email match fails to target any entity records', async () => {
    mockUserSearchService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login(mockLoginDto, mockAgent, mockIp),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
  });

  it('should throw UnauthorizedException if cryptography string comparisons evaluate to false', async () => {
    mockUserSearchService.findByEmail.mockResolvedValue(baseMockUser);
    mockCryptoService.compare.mockResolvedValue(false);

    await expect(
      service.login(mockLoginDto, mockAgent, mockIp),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
  });

  it('should bypass multi-tenant validation blocks if the target user profiles as SUPERADMIN', async () => {
    const superAdminUser = {
      ...baseMockUser,
      role: { name: UserRoleEnum.SUPERADMIN },
      neighborhood: null, // Superadmins don't belong to a single entity boundary
    } as unknown as User;

    mockUserSearchService.findByEmail.mockResolvedValue(superAdminUser);
    mockCryptoService.compare.mockResolvedValue(true);

    await service.login(mockLoginDto, mockAgent, mockIp);
    expect(mockSessionService.createSession).toHaveBeenCalled();
  });

  it('should throw ForbiddenException if neighborhood structural context assignment is missing', async () => {
    const detachedUser = {
      ...baseMockUser,
      neighborhood: null,
    } as unknown as User;
    mockUserSearchService.findByEmail.mockResolvedValue(detachedUser);
    mockCryptoService.compare.mockResolvedValue(true);

    await expect(
      service.login(mockLoginDto, mockAgent, mockIp),
    ).rejects.toThrow(
      new ForbiddenException('Invalid neighborhood assignation.'),
    );
  });

  it('should throw ForbiddenException if neighborhood status isActive evaluates to false', async () => {
    const suspendedTenantUser = {
      ...baseMockUser,
      neighborhood: { id: 10, isActive: false },
    } as unknown as User;

    mockUserSearchService.findByEmail.mockResolvedValue(suspendedTenantUser);
    mockCryptoService.compare.mockResolvedValue(true);

    await expect(
      service.login(mockLoginDto, mockAgent, mockIp),
    ).rejects.toThrow(new ForbiddenException('Neighborhood not available.'));
  });

  it('should throw ForbiddenException if user status profile is marked INACTIVE', async () => {
    const inactiveUser = {
      ...baseMockUser,
      status: { name: UserStatusEnum.INACTIVE },
    } as unknown as User;

    mockUserSearchService.findByEmail.mockResolvedValue(inactiveUser);
    mockCryptoService.compare.mockResolvedValue(true);

    await expect(
      service.login(mockLoginDto, mockAgent, mockIp),
    ).rejects.toThrow(
      new ForbiddenException(
        'Authentication disabled. Contact your administrator.',
      ),
    );
  });
});
