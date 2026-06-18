import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_RATE_LIMIT_KEY } from '../decorators/auth-rate-limit.decorator';

const reflector = new Reflector();

/**
 * Skips the auth throttler unless a route explicitly opts in via `@AuthRateLimit()`
 * (login/register). Limits come from THROTTLE_AUTH_LIMIT / THROTTLE_AUTH_TTL_MS.
 */
export function shouldSkipAuthThrottler(context: ExecutionContext): boolean {
  const handler = context.getHandler();
  const classRef = context.getClass();

  const enabled = reflector.getAllAndOverride<boolean>(AUTH_RATE_LIMIT_KEY, [
    handler,
    classRef,
  ]);

  return enabled !== true;
}
