import { keyPairsMapping } from "../../utils/constants";
import { getRSIStatus } from "../scheduler/rsiScheduler";
import { delay } from "../utils/delay";
import { renderRSISignal } from "../utils/renderRSISignal";
const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "BNBUSDT", "ETHUSDT"];
const markets = ["BTCUSDT", "SOLUSDT", "BNBUSDT", "ETHUSDT"];

// Common function to handle status by duration
export const handleStatusByDuration = async (
  ctx: any,
  duration: "1h" | "4h" | "1d",
  keyPairsMap: Record<string, string> | undefined = keyPairsMapping
) => {
  try {
    const keyName = ctx.match;
    const pairName = keyName;
    if (!pairName) {
      ctx.reply(
        `Please provide a valid pair name or you will get the status of the following pairs: ` +
          fallbackKeyPairs.join(", ")
      );
      fallbackKeyPairs.forEach(async (fallbackPair) => {
        const signals = await getRSIStatus(fallbackPair, duration);
        renderRSISignal(fallbackPair, signals as any, ctx, duration);
      });
      return;
    }
    const signals = await getRSIStatus(keyName, duration);
    renderRSISignal(keyName, signals as any, ctx, duration);
  } catch (error) {
    ctx.reply(`Error getting status for ${ctx.match}:`, error);
  }
};
