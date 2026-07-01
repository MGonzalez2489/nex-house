import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ExecutionContext } from '@nestjs/common';
import { Reflector, HttpAdapterHost } from '@nestjs/core';
import { TestingModule, Test } from '@nestjs/testing';
import { HttpCacheInterceptor } from './http-cache.interceptor';

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;
  let mockHttpAdapterHost: any;
  let mockExecutionContext: any;
  let mockRequest: any;

  beforeEach(async () => {
    mockRequest = {
      method: 'GET',
      url: '/api/neighborhood?first=0&rows=10',
    };

    mockHttpAdapterHost = {
      httpAdapter: {
        getRequestMethod: jest.fn().mockImplementation((req) => req.method),
        getRequestUrl: jest.fn().mockImplementation((req) => req.url),
      },
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpCacheInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: Reflector,
          useValue: {},
        },
        {
          provide: HttpAdapterHost,
          useValue: mockHttpAdapterHost,
        },
      ],
    }).compile();

    interceptor = module.get<HttpCacheInterceptor>(HttpCacheInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should return cache key for GET requests with query parameters', () => {
    const result = interceptor['trackBy'](
      mockExecutionContext as ExecutionContext,
    );
    expect(result).toBe('cache:/api/neighborhood?first=0&rows=10');
  });

  it('should return undefined if the request is not HTTP', () => {
    mockHttpAdapterHost.httpAdapter.getRequestMethod.mockReturnValue(undefined);
    const result = interceptor['trackBy'](
      mockExecutionContext as ExecutionContext,
    );
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-GET requests', () => {
    mockRequest.method = 'POST';
    const result = interceptor['trackBy'](
      mockExecutionContext as ExecutionContext,
    );
    expect(result).toBeUndefined();
  });
});

// describe('HttpCacheInterceptor', () => {
//   it('should be defined', () => {
//     expect(new HttpCacheInterceptor()).toBeDefined();
//   });
// });
