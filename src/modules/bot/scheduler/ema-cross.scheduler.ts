import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EmaCrossScheduler {
  // Your existing EMA cross scheduler logic will go here
  
  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    // Your existing cron job logic will go here
  }
}
