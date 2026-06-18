import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';
import * as webPush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    pushSubscription: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
      findMany: jest.Mock;
      delete: jest.Mock;
    };
  };

  const userId = 'user-1';

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      pushSubscription: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const values: Record<string, string> = {
                VAPID_PUBLIC_KEY: 'public-key',
                VAPID_PRIVATE_KEY: 'private-key',
                VAPID_SUBJECT: 'mailto:test@example.com',
              };
              return values[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
    service.onModuleInit();
    jest.clearAllMocks();
  });

  describe('getUnreadCount', () => {
    it('returns unread count for user', async () => {
      prisma.notification.count.mockResolvedValue(2);

      const result = await service.getUnreadCount(userId);

      expect(result).toEqual({ count: 2 });
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId, read: false },
      });
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      const row = {
        id: 'n-1',
        userId,
        type: NotificationType.PRODUCTION_REMINDER_24H,
        title: 'Scheduled',
        body: 'Body',
        read: true,
        productionId: 'prod-1',
        createdAt: new Date('2026-06-18T10:00:00.000Z'),
      };
      prisma.notification.findFirst.mockResolvedValue({ ...row, read: false });
      prisma.notification.update.mockResolvedValue(row);

      const result = await service.markAsRead(userId, 'n-1');

      expect(result.read).toBe(true);
    });

    it('throws when notification is missing', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead(userId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('subscribe', () => {
    it('upserts push subscription and removes other devices for user', async () => {
      prisma.pushSubscription.deleteMany.mockResolvedValue({ count: 1 });
      prisma.pushSubscription.upsert.mockResolvedValue({ id: 'sub-1' });

      const result = await service.subscribe(userId, {
        endpoint: 'https://push.example/1',
        keys: { p256dh: 'key', auth: 'auth' },
      });

      expect(result).toEqual({ ok: true });
      expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: {
          userId,
          endpoint: { not: 'https://push.example/1' },
        },
      });
      expect(prisma.pushSubscription.upsert).toHaveBeenCalled();
    });
  });

  describe('unsubscribeAll', () => {
    it('removes all push subscriptions for user', async () => {
      prisma.pushSubscription.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.unsubscribeAll(userId);

      expect(result).toEqual({ ok: true });
      expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('notifyAndPush', () => {
    it('creates notification and sends web push', async () => {
      prisma.notification.create.mockResolvedValue({ id: 'n-1' });
      prisma.pushSubscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          endpoint: 'https://push.example/1',
          p256dh: 'p256dh',
          auth: 'auth',
        },
      ]);
      (webPush.sendNotification as jest.Mock).mockResolvedValue(undefined);

      await service.notifyAndPush(userId, {
        type: NotificationType.PRODUCTION_REMINDER_24H,
        title: 'Scheduled',
        body: 'Show locked in',
        productionId: 'prod-1',
        url: '/productions/prod-1',
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          type: NotificationType.PRODUCTION_REMINDER_24H,
          title: 'Scheduled',
          body: 'Show locked in',
          productionId: 'prod-1',
        },
      });
      expect(webPush.sendNotification).toHaveBeenCalledTimes(1);
    });

    it('does not throw when push delivery fails', async () => {
      prisma.notification.create.mockResolvedValue({ id: 'n-1' });
      prisma.pushSubscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          endpoint: 'https://push.example/1',
          p256dh: 'p256dh',
          auth: 'auth',
        },
      ]);
      (webPush.sendNotification as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: 'failed',
      });

      await expect(
        service.notifyAndPush(userId, {
          type: NotificationType.PRODUCTION_REMINDER_2H,
          title: 'Upcoming',
          body: 'Tomorrow',
        }),
      ).resolves.toBeUndefined();
    });
  });
});
