import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let mockResponse: any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    };

    const loggerInstance = (filter as unknown as { logger: Logger }).logger;

    jest.spyOn(loggerInstance, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle standard NestJS HttpExceptions correctly', () => {
    const exception = new HttpException(
      'Forbidden resource',
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: null,
      message: 'Forbidden resource',
      meta: undefined,
      statusCode: HttpStatus.FORBIDDEN,
    });
  });

  it('should handle validation errors where the message is an array', () => {
    const exceptionResponse = {
      message: ['email must be an email', 'password is too short'],
      error: 'Bad Request',
      statusCode: 400,
    };
    const exception = new HttpException(
      exceptionResponse,
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: null,
      message: 'email must be an email, password is too short',
      meta: undefined,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('should fallback to INTERNAL_SERVER_ERROR (500) when an unknown error occurs', () => {
    const exception = new Error('Database connection crashed');

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: null,
      message: 'Internal server error',
      meta: undefined,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it('should stringify exceptionResponse if it is an object without a message property', () => {
    const rawObjectResponse = { customErrorCode: 'ERR_001', severity: 'HIGH' };
    const exception = new HttpException(
      rawObjectResponse,
      HttpStatus.BAD_GATEWAY,
    );

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: null,
      message: JSON.stringify(rawObjectResponse),
      meta: undefined,
      statusCode: HttpStatus.BAD_GATEWAY,
    });
  });
});
