import config from '@/utils/config';
import { RSIAnalysisService } from '@/services/processRSISignal';
import { Injectable } from '@nestjs/common';
import { delay } from '../utils/delay';
import { UpstoxInterval } from '@/utils/types/Duration';

@Injectable()
export class CommandHandlerService {
  constructor(private readonly rsiAnalysisService: RSIAnalysisService) {}

  async getStatusByDurationHandler(ctx: any, duration: '1h' | '4h' | '1d') {
    await this.handleStatusByDuration(ctx, duration);
  }

  private handleStatusByDuration = async (
    ctx: any,
    duration: '1h' | '4h' | '1d',
  ) => {
    try {
      const keyName = ctx.match;
      const pairName = keyName;
      if (!pairName) {
        ctx.reply(
          `Please provide a valid pair name or you will get the status of the following pairs: ` +
            config.BINANCE_KEY_PAIRS.join(', '),
        );
        await this.rsiAnalysisService.processRSIAnalysis(
          ctx,
          config.BINANCE_KEY_PAIRS,
          duration,
          true,
        );
        await delay(1000);
        await this.rsiAnalysisService.processRSIAnalysis(
          ctx,
          config.UPSTOX_KEY_PAIRS,
          duration === '1h'
            ? UpstoxInterval.OneHour
            : duration === '4h'
              ? UpstoxInterval.FourHours
              : UpstoxInterval.OneDay,
          true,
        );
        return;
      }
      await this.rsiAnalysisService.processRSIAnalysis(
        ctx,
        [keyName],
        duration,
      );
    } catch (error) {
      ctx.reply(`Error getting status for ${ctx.match}:`, error);
    }
  };
}
