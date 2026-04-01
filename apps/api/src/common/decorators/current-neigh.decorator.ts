import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentNeigh = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const neighborhood = request.neighborhood;

    return data ? neighborhood?.[data] : neighborhood;
  },
);
