import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
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
    user: {
      email: 'dev@nexhouse.com',
      isFirstAdmin: false,
      requirePwdChange: false,
      userUnits: [],
      publicId: 'user-public-1',
    },
  };

  const buildRequest = (overrides: {
    ip?: string;
    cookies?: Record<string, unknown>;
    'x-forwarded-for'?: unknown;
  } = {}) =>
    ({
      ip: overrides.ip,
      cookies: overrides.cookies,
      headers: overrides['x-forwarded-for'] !== undefined
        ? { 'x-forwarded-for': overrides['x-forwarded-for'] }
        : {},
    }) as unknown as ExpressRequest;

  const buildResponse = () => {
    const response: Record<string, jest.Mock> = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    return response as unknown as ExpressResponse;
  };

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn().mockResolvedValue(mockSession),
      refreshAuthentication: jest.fn(),
      logout: jest.fn().mockResolvedValue(undefined),
      createCookie: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should use the direct IP and set the refresh cookie', async () => {
      const request = buildRequest({ ip: '192.168.1.50' });
      const response = buildResponse();

      const result = await controller.login(
        mockLoginDto,
        request,
        mockUserAgent,
        response,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto,
        mockUserAgent,
        '192.168.1.50',
      );
      expect(mockAuthService.createCookie).toHaveBeenCalledWith(
        response,
        'mock-refresh-token',
      );
      expect(result).toEqual(mockSession);
    });

    it('should fall back to the first X-Forwarded-For entry when request.ip is missing', async () => {
      const request = buildRequest({
        'x-forwarded-for': '10.0.0.1, 172.16.0.1',
      });

      await controller.login(mockLoginDto, request, mockUserAgent, buildResponse());

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto,
        mockUserAgent,
        '10.0.0.1',
      );
    });

    it('should fall back to 0.0.0.0 when no ip source is available', async () => {
      const request = buildRequest();

      await controller.login(mockLoginDto, request, mockUserAgent, buildResponse());

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto,
        mockUserAgent,
        '0.0.0.0',
      );
    });
  });

  describe('refresh', () => {
    it('should rotate the session, omit the refreshToken and set a new cookie', async () => {
      const request = buildRequest({
        ip: '10.0.0.2',
        cookies: { refresh_token: 'old-refresh-token' },
      });
      const response = buildResponse();
      mockAuthService.refreshAuthentication.mockResolvedValue(mockSession);

      const result = await controller.refresh(request, mockUserAgent, response);

      expect(mockAuthService.refreshAuthentication).toHaveBeenCalledWith(
        'old-refresh-token',
        mockUserAgent,
        '10.0.0.2',
      );
      expect(mockAuthService.createCookie).toHaveBeenCalledWith(
        response,
        'mock-refresh-token',
      );
      expect(result).toEqual({
        token: mockSession.token,
        exp: mockSession.exp,
        user: mockSession.user,
      });
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when no refresh token cookie exists', async () => {
      const request = buildRequest({ cookies: {} });

      await expect(
        controller.refresh(request, mockUserAgent, buildResponse()),
      ).rejects.toThrow(new UnauthorizedException('No refresh token provided'));
      expect(mockAuthService.refreshAuthentication).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke the session when a refresh token cookie exists and clear the cookie', async () => {
      const request = buildRequest({
        cookies: { refresh_token: 'revoked-token' },
      });
      const response = buildResponse();

      const result = await controller.logout(request, response);

      expect(mockAuthService.logout).toHaveBeenCalledWith('revoked-token');
      expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false, // isProd is false under jest (NODE_ENV=test)
        sameSite: 'strict',
        path: '/',
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should still clear the cookie when no refresh token cookie exists', async () => {
      const request = buildRequest({ cookies: {} });
      const response = buildResponse();

      const result = await controller.logout(request, response);

      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});