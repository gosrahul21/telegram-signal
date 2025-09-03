import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './notification.entity';
import { BotModule } from '../bot/bot.module';
import { NotificationService } from './notification.service';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    BotModule,
    SocketModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
