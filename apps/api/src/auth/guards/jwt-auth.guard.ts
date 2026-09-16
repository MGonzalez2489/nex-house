import { IS_PUBLIC_KEY } from '@core/decorators';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Intercepts HTTP request execution contexts to determine authentication requirements.
   * Prioritizes checking for the presence of the `@Public()` metadata modifier decorator
   * at both the handler (method) and controller (class) bounds before evaluating JWT strategies.
   *
   * @param context Host execution context providing access to target routing handlers and classes.
   * @returns A promise resolving to a boolean indicating if the request may proceed.
   */
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // super.canActivate may resolve from a boolean, a promise or an rxjs stream
    // depending on the passport integration; normalize everything to a promise.
    const result = super.canActivate(context);

    if (result instanceof Observable) {
      return firstValueFrom(result);
    }

    return Promise.resolve(result);
  }
}
