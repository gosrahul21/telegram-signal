import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './notification.entity';
import { BotModule } from '../../bot/bot.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    BotModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService
  ],
  exports: [
    NotificationService
  ],
})
export class NotificationModule {}
