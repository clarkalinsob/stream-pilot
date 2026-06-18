import { SetMetadata } from '@nestjs/common';

export const AUTH_RATE_LIMIT_KEY = 'authRateLimit';

/** Opts a route into the `auth` throttler (limits from THROTTLE_AUTH_* env). */
export const AuthRateLimit = () => SetMetadata(AUTH_RATE_LIMIT_KEY, true);
