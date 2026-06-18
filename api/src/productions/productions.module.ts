import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductionsController } from './productions.controller';
import { ProductionsService } from './productions.service';

@Module({
  imports: [NotificationsModule],
  controllers: [ProductionsController],
  providers: [ProductionsService],
})
export class ProductionsModule {}
