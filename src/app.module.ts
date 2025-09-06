import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './modules/health/health.module';
import { NotificationModule } from './modules/notification';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketModule } from './modules/socket/socket.module';
import { AlertModule } from './modules/alert/alert.module';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { BotModule } from '@/modules/bot/bot.module';
import { MonitoringModule } from '@/modules/monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL_PROD),
    ScheduleModule.forRoot(),
    HealthModule,
    EventEmitterModule.forRoot(),
    // BotModule,
    NotificationModule,
    AuthModule,
    UserModule,
    SocketModule,
    AlertModule,
    MonitoringModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
