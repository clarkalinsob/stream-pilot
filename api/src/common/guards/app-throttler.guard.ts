import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

type RequestWithUser = Request & {
  user?: {
    id?: string;
  };
};

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: RequestWithUser): Promise<string> {
    const userId = req.user?.id;
    if (userId) {
      return Promise.resolve(userId);
    }

    return Promise.resolve(req.ip ?? 'unknown');
  }
}
