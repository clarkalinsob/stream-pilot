import { ExecutionContext } from '@nestjs/common';
import { AUTH_RATE_LIMIT_KEY } from '../decorators/auth-rate-limit.decorator';
import { shouldSkipAuthThrottler } from './throttler-auth.util';

function createContext(handler: object, classRef: object): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => classRef,
  } as ExecutionContext;
}

describe('shouldSkipAuthThrottler', () => {
  class TestController {
    open() {}
    login() {}
  }

  const controller = new TestController();

  afterEach(() => {
    Reflect.deleteMetadata(AUTH_RATE_LIMIT_KEY, controller.open);
    Reflect.deleteMetadata(AUTH_RATE_LIMIT_KEY, TestController);
    Reflect.deleteMetadata(AUTH_RATE_LIMIT_KEY, controller.login);
  });

  it('skips auth throttling for routes without @AuthRateLimit()', () => {
    expect(
      shouldSkipAuthThrottler(createContext(controller.open, TestController)),
    ).toBe(true);
  });

  it('enforces auth throttling when a route opts in via @AuthRateLimit()', () => {
    Reflect.defineMetadata(AUTH_RATE_LIMIT_KEY, true, controller.login);

    expect(
      shouldSkipAuthThrottler(createContext(controller.login, TestController)),
    ).toBe(false);
  });

  it('enforces auth throttling when enabled at controller level', () => {
    Reflect.defineMetadata(AUTH_RATE_LIMIT_KEY, true, TestController);

    expect(
      shouldSkipAuthThrottler(createContext(controller.open, TestController)),
    ).toBe(false);
  });
});
