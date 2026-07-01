import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;
    const isHttp = httpAdapter.getRequestMethod(request) !== undefined;

    if (!isHttp) {
      return undefined;
    }

    const requestMethod = httpAdapter.getRequestMethod(request);

    // just cach get requests
    if (requestMethod !== 'GET') {
      return undefined;
    }

    const url = httpAdapter.getRequestUrl(request);

    // create unique key based on the whole URL (including query params)
    return `cache:${url}`;
  }
}
