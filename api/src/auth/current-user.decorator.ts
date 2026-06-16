import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponse } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserResponse => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
