import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { AlertListenerService } from './alert-listener.service';
import { Alert, AlertSchema } from './alert.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alert.name, schema: AlertSchema }
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AlertController],
  providers: [AlertService, AlertListenerService],
  exports: [AlertService],
})
export class AlertModule {}
