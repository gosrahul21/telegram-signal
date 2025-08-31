import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { NotificationPersistenceService } from './notification-persistence.service';
// import { NotificationEventListenerService } from './notification-event-listener.service';
import { Notification, NotificationSchema } from './notification.entity';
import { BotModule } from '../../bot/bot.module';

@Module({
  imports: [
    BotModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    NotificationPersistenceService,
    // NotificationEventListenerService,
  ],
  exports: [
    NotificationService,
    NotificationGateway,
    NotificationPersistenceService,
    // NotificationEventListenerService,
  ],
})
export class NotificationModule {}
