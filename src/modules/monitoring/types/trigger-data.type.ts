import {
  BollingerBandsResult,
  EMACrossoverResult,
  MACDResult,
  RSIResult,
} from '../technical-analysis.service';

export type TriggerData = {
  currentPrice?: number;
  bbData?: BollingerBandsResult;
  emaData?: EMACrossoverResult;
  rsiData?: RSIResult;
  macdData?: MACDResult;
};
