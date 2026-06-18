import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { CrewModule } from './crew/crew.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EquipmentModule } from './equipment/equipment.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductionsModule } from './productions/productions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: Number(config.get('THROTTLE_TTL_MS') ?? 60000),
          limit: Number(config.get('THROTTLE_LIMIT') ?? 100),
        },
        {
          name: 'auth',
          ttl: Number(config.get('THROTTLE_AUTH_TTL_MS') ?? 60000),
          limit: Number(config.get('THROTTLE_AUTH_LIMIT') ?? 10),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ProductionsModule,
    CrewModule,
    EquipmentModule,
    DashboardModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule {}
