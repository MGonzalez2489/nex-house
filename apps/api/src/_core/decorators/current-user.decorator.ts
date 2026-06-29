import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the user from the Request object.
 * The user is injected into the request by the JwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested (e.g., @CurrentUser('id')), return only that
    return data ? user?.[data] : user;
  },
);
