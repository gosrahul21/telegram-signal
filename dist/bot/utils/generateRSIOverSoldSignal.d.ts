import { RSISignal } from "./renderRSISignal";
declare const generateRSIOversoldSignal: (keyName: string, candles: any, neutral?: boolean) => Promise<RSISignal[]>;
export default generateRSIOversoldSignal;
