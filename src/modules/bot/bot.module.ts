import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user';
import { AuthModule } from '../auth';
import { BotNotificationListenerService } from './bot-consumer.service';

@Module({
  imports: [AuthModule, UserModule, ConfigModule],
  providers: [BotService, BotNotificationListenerService],
  exports: [BotService, BotNotificationListenerService],
})
export class BotModule {}
