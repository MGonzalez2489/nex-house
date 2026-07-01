import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { of, throwError } from 'rxjs';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let mockCacheManager: any;
  let mockExecutionContext: any;
  let mockCallHandler: any;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(async () => {
    mockRequest = {
      method: 'POST',
      headers: {
        'x-idempotency-key': 'test-uuid-12345',
      },
    };

    mockResponse = {
      statusCode: 201,
      status: jest.fn().mockReturnThis(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };

    mockCallHandler = {
      handle: jest
        .fn()
        .mockReturnValue(of({ success: true, data: 'test_response' })),
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyInterceptor,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    interceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
  });

  it('debe estar definido', () => {
    expect(interceptor).toBeDefined();
  });

  it('debe omitir peticiones GET y continuar normalmente', async () => {
    mockRequest.method = 'GET';
    const result$ = await interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    expect(mockCacheManager.get).not.toHaveBeenCalled();
    result$.subscribe((val) => {
      expect(val).toEqual({ success: true, data: 'test_response' });
    });
  });

  it('debe lanzar BadRequestException si falta la cabecera X-Idempotency-Key', async () => {
    delete mockRequest.headers['x-idempotency-key'];

    await expect(
      interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe lanzar ConflictException si la transaccion ya esta iniciada', async () => {
    mockCacheManager.get.mockResolvedValue({ status: 'started' });

    await expect(
      interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('debe devolver la respuesta almacenada si el estatus es completado', async () => {
    mockCacheManager.get.mockResolvedValue({
      status: 'completed',
      response: {
        statusCode: 200,
        body: { cached: true },
      },
    });

    const result$ = await interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    result$.subscribe((val) => {
      expect(val).toEqual({ cached: true });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockCallHandler.handle).not.toHaveBeenCalled();
    });
  });

  it('debe procesar peticiones nuevas marcando inicio y luego completado con cache', async () => {
    mockCacheManager.get.mockResolvedValue(null);
    mockCacheManager.set.mockResolvedValue(undefined);

    const result$ = await interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    expect(mockCacheManager.set).toHaveBeenCalledWith(
      'idempotency:test-uuid-12345',
      { status: 'started' },
      120000,
    );

    result$.subscribe({
      next: (val) => {
        expect(val).toEqual({ success: true, data: 'test_response' });
      },
      complete: () => {
        expect(mockCacheManager.set).toHaveBeenLastCalledWith(
          'idempotency:test-uuid-12345',
          {
            status: 'completed',
            response: {
              statusCode: 201,
              body: { success: true, data: 'test_response' },
            },
          },
          86400000,
        );
      },
    });
  });

  it('debe eliminar la llave de cache en caso de fallo para permitir reintentos', async () => {
    mockCacheManager.get.mockResolvedValue(null);
    mockCallHandler.handle.mockReturnValue(
      throwError(() => new Error('Db fail')),
    );

    const result$ = await interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    result$.subscribe({
      error: (err) => {
        expect(err.message).toBe('Db fail');
        expect(mockCacheManager.del).toHaveBeenCalledWith(
          'idempotency:test-uuid-12345',
        );
      },
    });
  });
});

// import { IdempotencyInterceptor } from './idempotency.interceptor';
//
// describe('IdempotencyInterceptor', () => {
//   it('should be defined', () => {
//     expect(new IdempotencyInterceptor()).toBeDefined();
//   });
// });
