import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, of, tap } from 'rxjs';
import { Cache } from 'cache-manager';

interface IdempotentRecord {
  status: 'started' | 'completed';
  response?: any;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;

    // apply just to POST,PATCH,PUT,DELETE
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const idempotencyKey = request.headers['x-idempotency-key'];

    if (!idempotencyKey) {
      // optiona: throw error or move forward if is not required
      throw new BadRequestException('X-Idempotency-Key required.');
    }

    const cacheKey = `idempotency:${idempotencyKey}`;
    const cachedRecord =
      await this.cacheManager.get<IdempotentRecord>(cacheKey);

    if (cachedRecord) {
      if (cachedRecord.status === 'started') {
        throw new ConflictException('Transaction in progress...');
      }

      // if it is done, send back the saved response
      response.status(cachedRecord.response.statusCode || 200);
      return of(cachedRecord.response.body);
    }

    // save initial state as 'started' (short TTL to avoid eternal blockers)
    await this.cacheManager.set(cacheKey, { status: 'started' }, 1000 * 60 * 2);

    return next.handle().pipe(
      tap(async (body) => {
        // if success, save response (TTL 24 hours for duplicateds)
        const successRecord: IdempotentRecord = {
          status: 'completed',
          response: {
            statusCode: response.statusCode,
            body,
          },
        };
        await this.cacheManager.set(
          cacheKey,
          successRecord,
          1000 * 60 * 60 * 24,
        );
      }),
      catchError(async (error) => {
        //if error, remove key to let retries
        await this.cacheManager.del(cacheKey);
        throw error;
      }),
    );
  }
}
