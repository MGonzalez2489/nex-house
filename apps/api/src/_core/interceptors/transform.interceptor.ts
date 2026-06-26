/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@nexhouse/shared-domain/interfaces';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: any): ApiResponse<T> => {
        const hasMeta = data && data.meta;

        const result = hasMeta ? data.data : data;
        const meta = hasMeta ? data.meta : undefined;

        return {
          data: result ?? (Array.isArray(result) ? [] : {}),
          meta,
          message: data?.message || 'Request successful',
          statusCode: context.switchToHttp().getResponse().statusCode,
        };
      }),
    );
  }
}
