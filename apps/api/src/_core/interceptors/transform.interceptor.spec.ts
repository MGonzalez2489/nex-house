/* eslint-disable @typescript-eslint/no-explicit-any */
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;
  let mockStatusCode: number;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    mockStatusCode = 200;

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          statusCode: mockStatusCode,
        }),
      }),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform a simple data response into standard ApiResponse format', (done) => {
    const rawData = { id: 1, name: 'Test Object' };

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(rawData)),
    };

    interceptor
      .intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      )
      .subscribe((response) => {
        expect(response).toEqual({
          data: rawData,
          meta: undefined,
          message: 'Request successful',
          statusCode: 200,
        });
        done();
      });
  });

  it('should extract meta data correctly when response is paginated', (done) => {
    const paginatedData = {
      data: [{ id: 1 }, { id: 2 }],
      meta: {
        total: 2,
        page: 1,
        lastPage: 1,
        limit: 10,
        existRecords: true,
      },
      message: 'Custom list message',
    };

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(paginatedData)),
    };

    interceptor
      .intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      )
      .subscribe((response) => {
        expect(response).toEqual({
          data: paginatedData.data,
          meta: paginatedData.meta,
          message: 'Custom list message',
          statusCode: 200,
        });
        done();
      });
  });

  it('should fallback to an empty array when result data is null and expected to be an array', (done) => {
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(null)),
    };

    interceptor
      .intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      )
      .subscribe((response) => {
        expect(response.data).toEqual({});
        expect(response.message).toBe('Request successful');
        done();
      });
  });

  it('should dynamic map different HTTP status codes', (done) => {
    mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue({
        statusCode: 201,
      }),
    });

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ success: true })),
    };

    interceptor
      .intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      )
      .subscribe((response) => {
        expect(response.statusCode).toBe(201);
        done();
      });
  });
});
