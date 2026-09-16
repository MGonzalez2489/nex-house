import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '@core/decorators';
import { throwError, of } from 'rxjs';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockReflector: jest.Mocked<Reflector>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;

  beforeEach(async () => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as jest.Mocked<ExecutionContext>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should bypass authentication and return true if the route is marked with @Public() decorator', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);

    const canActivate = await guard.canActivate(mockExecutionContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
    );
    expect(canActivate).toBe(true);
  });

  describe('delegation to the passport strategy', () => {
    let spySuperCanActivate: jest.SpyInstance;

    afterEach(() => {
      spySuperCanActivate?.mockRestore();
    });

    it('should delegate evaluation and return true when super resolves with a promise of true', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      spySuperCanActivate = jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => Promise.resolve(true));

      const canActivate = await guard.canActivate(mockExecutionContext);

      expect(spySuperCanActivate).toHaveBeenCalledWith(mockExecutionContext);
      expect(canActivate).toBe(true);
    });

    it('should return false when super resolves with a synchronous false', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      spySuperCanActivate = jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => false);

      const canActivate = await guard.canActivate(mockExecutionContext);

      expect(canActivate).toBe(false);
    });

    it('should unwrap an rxjs Observable of true via the strategy stream', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      spySuperCanActivate = jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => of(true));

      const canActivate = await guard.canActivate(mockExecutionContext);

      expect(canActivate).toBe(true);
    });

    it('should propagate strategy stream errors as rejections', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      const strategyError = new UnauthorizedException('Unauthorized');
      spySuperCanActivate = jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => throwError(() => strategyError));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        strategyError,
      );
    });

    it('should reject when the strategy observable emits false', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      spySuperCanActivate = jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => of(false));

      const canActivate = await guard.canActivate(mockExecutionContext);

      expect(canActivate).toBe(false);
    });
  });
});