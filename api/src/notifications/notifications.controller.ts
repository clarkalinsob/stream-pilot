import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { UserResponse } from '../auth/auth.types';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { NotificationsService } from './notifications.service';
import { RemindersCronService } from './reminders.cron';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private remindersCronService: RemindersCronService,
  ) {}

  @Public()
  @Get('vapid-public-key')
  getVapidPublicKey() {
    return this.notificationsService.getVapidPublicKey();
  }

  @Get()
  findAll(
    @CurrentUser() user: UserResponse,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationsService.findAll(user.id, query);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: UserResponse) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: UserResponse) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: UserResponse, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Post('subscribe')
  subscribe(@CurrentUser() user: UserResponse, @Body() dto: SubscribeDto) {
    return this.notificationsService.subscribe(user.id, dto);
  }

  @Delete('unsubscribe')
  unsubscribe(@CurrentUser() user: UserResponse, @Body() dto: UnsubscribeDto) {
    return this.notificationsService.unsubscribe(user.id, dto.endpoint);
  }

  @Post('unsubscribe-all')
  unsubscribeAll(@CurrentUser() user: UserResponse) {
    return this.notificationsService.unsubscribeAll(user.id);
  }

  @Post('run-reminders')
  runReminders() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(
        'Manual reminder trigger is disabled in production',
      );
    }
    return this.remindersCronService.runUpcomingProductionReminders();
  }
}
