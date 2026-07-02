import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { NeighborhoodScopeGuard } from './neigh-scope.guard';

describe('NeighborhoodScopeGuard', () => {
  let guard: NeighborhoodScopeGuard;
  let mockExecutionContext: any;
  let mockRequest: any;

  beforeEach(() => {
    guard = new NeighborhoodScopeGuard();
    mockRequest = {
      user: { id: 1, neighborhoodId: 10 },
      params: { neighborhoodId: '10' },
    };
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow activation if user neighborhood matches parameter', () => {
    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      true,
    );
  });

  it('should throw ForbiddenException if user is missing', () => {
    delete mockRequest.user;
    expect(() =>
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).toThrow(new ForbiddenException('Missing security context parameters.'));
  });

  it('should throw ForbiddenException if neighborhoodId param is missing', () => {
    delete mockRequest.params.neighborhoodId;
    expect(() =>
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).toThrow(new ForbiddenException('Missing security context parameters.'));
  });

  it('should throw ForbiddenException if neighborhoodId does not match', () => {
    mockRequest.params.neighborhoodId = '20';
    expect(() =>
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).toThrow(new ForbiddenException('Forbidden neighborhood scope.'));
  });
});

// import { NeighborhoodScopeGuard } from './neigh-scope.guard';
//
// describe('NeighScopeGuard', () => {
//   it('should be defined', () => {
//     expect(new NeighborhoodScopeGuard()).toBeDefined();
//   });
// });
