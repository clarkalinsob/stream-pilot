import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType, ProductionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { RemindersCronService } from './reminders.cron';

describe('RemindersCronService', () => {
  let service: RemindersCronService;
  let prisma: {
    production: { findMany: jest.Mock };
    notification: { findFirst: jest.Mock };
  };
  let notificationsService: { notifyAndPush: jest.Mock };

  beforeEach(async () => {
    prisma = {
      production: { findMany: jest.fn() },
      notification: { findFirst: jest.fn() },
    };
    notificationsService = { notifyAndPush: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersCronService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(RemindersCronService);
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-18T08:00:30.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends a 24-hour reminder when the event is one day away', async () => {
    prisma.production.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        userId: 'user-1',
        title: 'Morning Show',
        eventDate: new Date('2026-06-19T00:00:00.000Z'),
        startTime: new Date(Date.UTC(1970, 0, 1, 8, 0)),
        startsAt: new Date('2026-06-19T08:00:00.000Z'),
        status: ProductionStatus.SCHEDULED,
      },
    ]);
    prisma.notification.findFirst.mockResolvedValue(null);
    notificationsService.notifyAndPush.mockResolvedValue(undefined);

    const result = await service.runUpcomingProductionReminders();

    expect(result.sent).toBe(1);
    expect(notificationsService.notifyAndPush).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        type: NotificationType.PRODUCTION_REMINDER_24H,
        productionId: 'prod-1',
        title: 'Reminder: Morning Show in 24 hours',
      }),
    );
  });

  it('sends a 2-hour reminder when the event is two hours away', async () => {
    jest.setSystemTime(new Date('2026-06-19T06:00:30.000Z'));

    prisma.production.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        userId: 'user-1',
        title: 'Morning Show',
        eventDate: new Date('2026-06-19T00:00:00.000Z'),
        startTime: new Date(Date.UTC(1970, 0, 1, 8, 0)),
        startsAt: new Date('2026-06-19T08:00:00.000Z'),
        status: ProductionStatus.SCHEDULED,
      },
    ]);
    prisma.notification.findFirst.mockResolvedValue(null);
    notificationsService.notifyAndPush.mockResolvedValue(undefined);

    const result = await service.runUpcomingProductionReminders();

    expect(result.sent).toBe(1);
    expect(notificationsService.notifyAndPush).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        type: NotificationType.PRODUCTION_REMINDER_2H,
        productionId: 'prod-1',
        title: 'Reminder: Morning Show in 2 hours',
      }),
    );
  });

  it('skips productions without startsAt', async () => {
    prisma.production.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        userId: 'user-1',
        title: 'Morning Show',
        eventDate: new Date('2026-06-19T00:00:00.000Z'),
        startTime: new Date(Date.UTC(1970, 0, 1, 8, 0)),
        startsAt: null,
        status: ProductionStatus.SCHEDULED,
      },
    ]);

    const result = await service.runUpcomingProductionReminders();

    expect(result.sent).toBe(0);
    expect(notificationsService.notifyAndPush).not.toHaveBeenCalled();
  });

  it('skips productions that already have the matching reminder', async () => {
    prisma.production.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        userId: 'user-1',
        title: 'Morning Show',
        eventDate: new Date('2026-06-19T00:00:00.000Z'),
        startTime: new Date(Date.UTC(1970, 0, 1, 8, 0)),
        startsAt: new Date('2026-06-19T08:00:00.000Z'),
        status: ProductionStatus.SCHEDULED,
      },
    ]);
    prisma.notification.findFirst.mockResolvedValue({ id: 'existing' });

    const result = await service.runUpcomingProductionReminders();

    expect(result.sent).toBe(0);
    expect(notificationsService.notifyAndPush).not.toHaveBeenCalled();
  });
});
