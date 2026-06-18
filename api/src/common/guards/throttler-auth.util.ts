import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const AUTH_THROTTLE_LIMIT_KEY = 'THROTTLER:LIMITauth';

const reflector = new Reflector();

/**
 * Skips the auth throttler unless a route explicitly opts in via
 * `@Throttle({ auth: { limit, ttl } })` (login/register).
 */
export function shouldSkipAuthThrottler(context: ExecutionContext): boolean {
  const handler = context.getHandler();
  const classRef = context.getClass();

  const authLimit = reflector.getAllAndOverride<unknown>(AUTH_THROTTLE_LIMIT_KEY, [
    handler,
    classRef,
  ]);

  return authLimit === undefined;
}

export { AUTH_THROTTLE_LIMIT_KEY };
