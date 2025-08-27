import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './bot/bot.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationModule } from './modules/notification';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketModule } from './modules/socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL_PROD),
    ScheduleModule.forRoot(),
    BotModule,
    HealthModule,
    NotificationModule,
    AuthModule,
    UserModule,
    SocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
