import { Module } from '@nestjs/common';
import { EmaCrossScheduler } from './ema-cross.scheduler';
import { RsiScheduler } from './rsi.scheduler';

@Module({
  providers: [
    EmaCrossScheduler,
    RsiScheduler,
  ],
  exports: [
    EmaCrossScheduler,
    RsiScheduler,
  ],
})
export class SchedulerModule {}
