import { RSISignal } from "./renderRSISignal";
export declare const generateRSISignal: (keyName: string, candles: any, neutral?: boolean) => Promise<RSISignal[]>;
export default generateRSISignal;
