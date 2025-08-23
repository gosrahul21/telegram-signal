import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { NotificationExampleService } from './notification.example.service';
import { BotModule } from '../../bot/bot.module';

@Module({
  imports: [BotModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    NotificationExampleService,
  ],
  exports: [
    NotificationService,
    NotificationGateway,
    NotificationExampleService,
  ],
})
export class NotificationModule {}
