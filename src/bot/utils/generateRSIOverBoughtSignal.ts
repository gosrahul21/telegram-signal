import config from "../../config";
import { calculateRSI } from "../../utils/helper/techincalIndicators";
import { RSISignal } from "./renderRSISignal";
import rsiSignal from "./rsiSIgnal";

/**
 * Check RSI overbought conditions
 */
export const generateRSISignal = async (
  keyName: string,
  candles: any,
  neutral: boolean = false
): Promise<RSISignal[]> => {
  // const candles: any = await fetchCandleData(keyName, duration);
  const rsiValues = calculateRSI(
    candles.map((candle: any) => candle.close),
    14
  );
  const currentRSI = rsiValues[rsiValues.length - 1];

  const mostRecentIndex = candles.length - 1;
  const signals: RSISignal[] = rsiSignal(
    currentRSI,
    keyName,
    candles[mostRecentIndex].close,
    candles[mostRecentIndex].closeTime,
    neutral
  );
  return signals;
};

export default generateRSISignal;
