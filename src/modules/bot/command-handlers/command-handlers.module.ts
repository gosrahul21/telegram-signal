import { Module } from '@nestjs/common';
import { DayStatusHandler } from './day-status.handler';
import { FourHourStatusHandler } from './four-hour-status.handler';
import { HourStatusHandler } from './hour-status.handler';
import { OnSubscribeHandler } from './on-subscribe.handler';
import { UnsubscribeHandler } from './unsubscribe.handler';
import { HandleStatusByDurationHandler } from './handle-status-by-duration.handler';

@Module({
  providers: [
    DayStatusHandler,
    FourHourStatusHandler,
    HourStatusHandler,
    OnSubscribeHandler,
    UnsubscribeHandler,
    HandleStatusByDurationHandler,
  ],
  exports: [
    DayStatusHandler,
    FourHourStatusHandler,
    HourStatusHandler,
    OnSubscribeHandler,
    UnsubscribeHandler,
    HandleStatusByDurationHandler,
  ],
})
export class CommandHandlersModule {}
