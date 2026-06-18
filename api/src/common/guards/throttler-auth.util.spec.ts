import { ExecutionContext } from '@nestjs/common';
import {
  AUTH_THROTTLE_LIMIT_KEY,
  shouldSkipAuthThrottler,
} from './throttler-auth.util';

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
    Reflect.deleteMetadata(AUTH_THROTTLE_LIMIT_KEY, controller.open);
    Reflect.deleteMetadata(AUTH_THROTTLE_LIMIT_KEY, TestController);
    Reflect.deleteMetadata(AUTH_THROTTLE_LIMIT_KEY, controller.login);
  });

  it('skips auth throttling for routes without explicit auth limits', () => {
    expect(
      shouldSkipAuthThrottler(createContext(controller.open, TestController)),
    ).toBe(true);
  });

  it('enforces auth throttling when a route opts in via @Throttle({ auth })', () => {
    Reflect.defineMetadata(AUTH_THROTTLE_LIMIT_KEY, 10, controller.login);

    expect(
      shouldSkipAuthThrottler(createContext(controller.login, TestController)),
    ).toBe(false);
  });

  it('enforces auth throttling when limits are set at controller level', () => {
    Reflect.defineMetadata(AUTH_THROTTLE_LIMIT_KEY, 10, TestController);

    expect(
      shouldSkipAuthThrottler(createContext(controller.open, TestController)),
    ).toBe(false);
  });
});
