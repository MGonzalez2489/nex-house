import { IS_PUBLIC_KEY } from '@core/decorators';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Intercepts HTTP request execution contexts to determine authentication requirements.
   * Prioritizes checking for the presence of the `@Public()` metadata modifier decorator
   * at both the handler (method) and controller (class) bounds before evaluating JWT strategies.
   *
   * @param context Host execution context providing access to target routing handlers and classes.
   * @returns A boolean, or a promise/observable resolving to a boolean, indicating if the request may proceed.
   */
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Standardize execution stream as async/await since super.canActivate may return sync or async results
    const result = super.canActivate(context);

    if (result instanceof Observable) {
      return new Promise((resolve, reject) => {
        result.subscribe({
          next: (valid) => resolve(valid),
          error: (err) => reject(err),
        });
      });
    }

    return (await result) as boolean;
  }
}
