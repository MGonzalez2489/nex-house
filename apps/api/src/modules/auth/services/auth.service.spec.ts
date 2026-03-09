import { CryptoService } from '@common/services';
import { UserService } from '@modules/user';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CryptoServiceMock,
  JwtServiceMock,
  MockUser,
  UserServiceMock,
} from '@test/mocks';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let cryptoService: jest.Mocked<CryptoService>;
  let jwtService: jest.Mocked<JwtService>;
  const token = 'jwt_token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: UserServiceMock,
        },
        {
          provide: CryptoService,
          useValue: CryptoServiceMock,
        },
        {
          provide: JwtService,
          useValue: JwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    cryptoService = module.get(CryptoService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = { email: 'test@example.com', password: 'password123' };

    it('should register a new user successfully', async () => {
      jwtService.sign.mockReturnValue(token);
      userService.findByEmail.mockResolvedValue(undefined);
      cryptoService.hash.mockResolvedValue('hashed_password');
      userService.create.mockResolvedValue(MockUser as any);

      const decoded = {
        exp: 123,
      };

      jwtService.decode.mockReturnValue(decoded as any);

      const result = await service.register(registerDto);

      expect(result.token).toBe('jwt_token');
      expect(userService.create).toHaveBeenCalledWith(
        registerDto.email,
        'hashed_password',
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      userService.findByEmail.mockResolvedValue(MockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should return a session on valid credentials', async () => {
      userService.findByEmail.mockResolvedValue(MockUser as any);

      const decoded = {
        exp: 123,
      };

      jwtService.decode.mockReturnValue(decoded as any);
      cryptoService.compare.mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.token).toBe('jwt_token');
      expect(cryptoService.compare).toHaveBeenCalledWith(
        loginDto.password,
        MockUser.password,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      userService.findByEmail.mockResolvedValue(MockUser as any);
      cryptoService.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
