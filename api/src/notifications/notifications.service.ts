import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType } from '@prisma/client';
import * as webPush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import {
  NotificationItem,
  NotifyPayload,
  PaginatedNotificationsResponse,
} from './notifications.types';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  onModuleInit(): void {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY')?.trim();
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY')?.trim();
    const subject = (
      this.config.get<string>('VAPID_SUBJECT') ?? 'mailto:you@example.com'
    ).trim();

    if (publicKey && privateKey) {
      webPush.setVapidDetails(subject, publicKey, privateKey);
    } else {
      this.logger.warn(
        'VAPID keys not configured — push delivery will be skipped',
      );
    }
  }

  getVapidPublicKey(): { publicKey: string } {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY')?.trim();
    if (!publicKey) {
      throw new NotFoundException('VAPID public key is not configured');
    }
    return { publicKey };
  }

  async findAll(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = { userId };

    const [rows, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: rows.map(toNotificationItem),
      meta: { page, limit, total, totalPages },
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(userId: string, id: string): Promise<NotificationItem> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return toNotificationItem(updated);
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: result.count };
  }

  async subscribe(userId: string, dto: SubscribeDto): Promise<{ ok: true }> {
    await this.prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint: { not: dto.endpoint },
      },
    });

    await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
      update: {
        userId,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
    });
    return { ok: true };
  }

  async unsubscribe(userId: string, endpoint: string): Promise<{ ok: true }> {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
    return { ok: true };
  }

  async unsubscribeAll(userId: string): Promise<{ ok: true }> {
    await this.prisma.pushSubscription.deleteMany({ where: { userId } });
    return { ok: true };
  }

  async notifyAndPush(userId: string, payload: NotifyPayload): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        productionId: payload.productionId,
      },
    });

    await this.sendPushToUser(userId, {
      title: payload.title,
      body: payload.body,
      url: payload.url,
    });
  }

  async sendPushToUser(
    userId: string,
    payload: { title: string; body: string; url?: string },
  ): Promise<void> {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY')?.trim();
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY')?.trim();

    if (!publicKey || !privateKey) {
      return;
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? '/notifications',
    });

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            pushPayload,
          );
        } catch (error) {
          const statusCode =
            error && typeof error === 'object' && 'statusCode' in error
              ? (error as { statusCode: number }).statusCode
              : null;

          this.logger.warn(
            `Push failed for subscription ${sub.id}: ${error instanceof Error ? error.message : 'unknown error'}`,
          );

          if (
            statusCode === 401 ||
            statusCode === 403 ||
            statusCode === 404 ||
            statusCode === 410
          ) {
            await this.prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          }
        }
      }),
    );
  }
}

function toNotificationItem(row: {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  productionId: string | null;
  createdAt: Date;
}): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.read,
    productionId: row.productionId,
    createdAt: row.createdAt.toISOString(),
  };
}
