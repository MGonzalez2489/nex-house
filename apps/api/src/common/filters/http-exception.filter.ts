import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiResponse } from '@nex-house/interfaces';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get the error message
    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof exceptionResponse === 'object'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (exceptionResponse as any).message ||
          JSON.stringify(exceptionResponse)
        : exceptionResponse;

    // Log the error for the backend team
    this.logger.error(
      `Http Status: ${status} Error: ${JSON.stringify(message)}`,
      (exception as Error).stack,
    );
    console.log(
      `Http Status: ${status} Error: ${JSON.stringify(message)}`,
      (exception as Error).stack,
    );

    const errorResponse: ApiResponse<null> = {
      data: null,
      message: Array.isArray(message) ? message.join(', ') : message,
      meta: undefined,
      statusCode: status,
    };

    response.status(status).json(errorResponse);
  }
}
