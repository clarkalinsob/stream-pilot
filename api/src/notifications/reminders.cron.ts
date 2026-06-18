import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, ProductionStatus } from '@prisma/client';
import {
  isWithinHoursBeforeEvent,
  toDateString,
  toTimeString,
} from '../productions/event-schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

const REMINDER_WINDOWS = [
  { hoursBefore: 24, type: NotificationType.PRODUCTION_REMINDER_24H },
  { hoursBefore: 2, type: NotificationType.PRODUCTION_REMINDER_2H },
] as const;

@Injectable()
export class RemindersCronService {
  private readonly logger = new Logger(RemindersCronService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleUpcomingProductionReminders(): Promise<void> {
    await this.runUpcomingProductionReminders();
  }

  async runUpcomingProductionReminders(): Promise<{ sent: number }> {
    const now = new Date();

    const productions = await this.prisma.production.findMany({
      where: {
        status: ProductionStatus.SCHEDULED,
        startsAt: { not: null },
      },
    });

    let sent = 0;

    for (const production of productions) {
      if (!production.startsAt) {
        continue;
      }

      const eventLabel = formatScheduleLabel(
        production.eventDate,
        production.startTime,
      );

      for (const reminder of REMINDER_WINDOWS) {
        if (
          !isWithinHoursBeforeEvent(
            production.startsAt,
            now,
            reminder.hoursBefore,
          )
        ) {
          continue;
        }

        const existing = await this.prisma.notification.findFirst({
          where: {
            userId: production.userId,
            productionId: production.id,
            type: reminder.type,
          },
        });

        if (existing) {
          continue;
        }

        try {
          await this.notificationsService.notifyAndPush(production.userId, {
            type: reminder.type,
            title: `Reminder: ${production.title} in ${reminder.hoursBefore} hours`,
            body: eventLabel,
            productionId: production.id,
            url: `/productions/${production.id}`,
          });
          sent += 1;
        } catch (error) {
          this.logger.warn(
            `Failed to send ${reminder.hoursBefore}h reminder for production ${production.id}: ${error instanceof Error ? error.message : 'unknown error'}`,
          );
        }
      }
    }

    return { sent };
  }
}

function formatScheduleLabel(
  eventDate: Date | null,
  startTime: Date | null,
): string {
  if (!eventDate) {
    return 'Schedule not set';
  }

  const dateLabel = toDateString(eventDate) ?? 'TBD';
  const timeLabel = startTime ? toTimeString(startTime) : null;
  return timeLabel ? `${dateLabel} at ${timeLabel}` : dateLabel;
}
