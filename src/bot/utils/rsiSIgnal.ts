import config from "../../config";
import { RSISignal } from "./renderRSISignal";

export const rsiSignal = (
  currentRSI: number,
  keyName: string,
  price: number,
  time: number,
  neutral: boolean = false
) => {
  const signals: RSISignal[] = [];

  if (currentRSI >= config.RSI_EXTREME_OVERBOUGHT) {
    signals.push({
      type: `${keyName} RSI Extreme Overbought`,
      time: time,
      price: price,
      rsi: currentRSI,
      details: `RSI is extremely overbought at ${currentRSI.toFixed(
        2
      )}, strong sell signal`,
    });
  } else if (currentRSI >= config.RSI_OVERBOUGHT_THRESHOLD) {
    signals.push({
      type: `${keyName} RSI Overbought`,
      time: time,
      price: price,
      rsi: currentRSI,
      details: `RSI is overbought at ${currentRSI.toFixed(
        2
      )}, potential sell signal`,
    });
  }
  if (currentRSI <= config.RSI_EXTREME_OVERSOLD) {
    signals.push({
      type: `${keyName} RSI Extreme Oversold`,
      time: time,
      price: price,
      rsi: currentRSI,
      details: `RSI is extremely oversold at ${currentRSI.toFixed(
        2
      )}, strong buy signal`,
    });
  } else if (currentRSI <= config.RSI_OVERSOLD_THRESHOLD) {
    signals.push({
      type: `${keyName} RSI Oversold`,
      time: time,
      price: price,
      rsi: currentRSI,
      details: `RSI is oversold at ${currentRSI.toFixed(
        2
      )}, potential buy signal`,
    });
  } else if (neutral) {
    signals.push({
      type: `${keyName} RSI Neutral`,
      time: time,
      price: price,
      rsi: currentRSI,
      details: `RSI is neutral at ${currentRSI.toFixed(2)}`,
    });
  }

  return signals;
};

export default rsiSignal;
