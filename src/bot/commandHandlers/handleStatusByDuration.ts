import config from '../../config';
import { UpstoxInterval } from '@/types/Duration';
import { delay } from '../utils/delay';
import processRSIAnalysis from '../../services/processRSISignal';

// Common function to handle status by duration
export const handleStatusByDuration = async (
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
      await processRSIAnalysis(ctx, config.BINANCE_KEY_PAIRS, duration, true);
      await delay(1000);
      await processRSIAnalysis(
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
    await processRSIAnalysis(ctx, [keyName], duration);
  } catch (error) {
    ctx.reply(`Error getting status for ${ctx.match}:`, error);
  }
};
