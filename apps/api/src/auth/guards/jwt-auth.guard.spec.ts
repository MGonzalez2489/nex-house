import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '@core/decorators';

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

  it('should delegate evaluation to super.canActivate and return true when route is private and token is valid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const spySuperCanActivate = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockImplementation(() => Promise.resolve(true));

    const canActivate = await guard.canActivate(mockExecutionContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
    );
    expect(spySuperCanActivate).toHaveBeenCalledWith(mockExecutionContext);
    expect(canActivate).toBe(true);
    spySuperCanActivate.mockRestore();
  });

  it('should delegate evaluation to super.canActivate and return false when route is private and token is invalid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const spySuperCanActivate = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockImplementation(() => Promise.resolve(false));

    const canActivate = await guard.canActivate(mockExecutionContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
    );
    expect(spySuperCanActivate).toHaveBeenCalledWith(mockExecutionContext);
    expect(canActivate).toBe(false);
    spySuperCanActivate.mockRestore();
  });
});
