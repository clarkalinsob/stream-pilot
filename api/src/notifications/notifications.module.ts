import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RemindersCronService } from './reminders.cron';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, RemindersCronService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
