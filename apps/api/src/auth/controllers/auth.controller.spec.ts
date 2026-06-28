import { Test, TestingModule } from '@nestjs/testing';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from '../services';
import { LoginDto } from '../dtos';
import { SessionModel } from '@nexhouse/shared-domain/models';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  const mockLoginDto: LoginDto = {
    email: 'dev@nexhouse.com',
    password: 'securePassword123',
  };

  const mockUserAgent = 'Mozilla/5.0 (Ubuntu; Linux x86_64)';
  const mockSession: SessionModel = {
    token: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    exp: 1719576000,
  };

  // Mocks bases para Express
  let mockRequest: Partial<ExpressRequest>;
  let mockResponse: Partial<ExpressResponse>;

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn().mockResolvedValue(mockSession),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    // Reiniciamos las instancias de los mocks de Express en cada test
    mockRequest = {
      ip: undefined,
      headers: {},
    };
    mockResponse = {};
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should extract the direct IP from the request object and execute login', async () => {
      const mockExpressRequest = {
        ip: '192.168.1.50',
        headers: {},
      } as unknown as ExpressRequest;

      const result = await controller.login(
        mockLoginDto,
        mockExpressRequest,
        mockUserAgent,
        mockResponse as ExpressResponse,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto,
        mockUserAgent,
        '192.168.1.50',
      );
      expect(result).toEqual(mockSession);
    });

    it('should fallback to x-forwarded-for header when request.ip is undefined', async () => {
      const mockExpressRequest = {
        ip: undefined,
        headers: {
          'x-forwarded-for': '10.0.0.1, 172.16.0.1',
        },
      } as unknown as ExpressRequest;

      const result = await controller.login(
        mockLoginDto,
        mockExpressRequest,
        mockUserAgent,
        mockResponse as ExpressResponse,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto,
        mockUserAgent,
        '10.0.0.1, 172.16.0.1',
      );
      expect(result).toEqual(mockSession);
    });

    it('should fallback to 0.0.0.0 if both request.ip and x-forwarded-for header are missing', async () => {
      const mockExpressRequest = {
        ip: undefined,
        headers: {},
      } as unknown as ExpressRequest;

      const result = await controller.login(
        mockLoginDto,
        mockExpressRequest,
        mockUserAgent,
        mockResponse as ExpressResponse,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto,
        mockUserAgent,
        '0.0.0.0',
      );
      expect(result).toEqual(mockSession);
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
//
// describe('AuthController', () => {
//   let controller: AuthController;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [AuthController],
//     }).compile();
//
//     controller = module.get<AuthController>(AuthController);
//   });
//
//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
