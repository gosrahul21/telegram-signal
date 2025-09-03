import { Bot } from "grammy";
export interface RSIStatus {
    type: "Extreme Overbought" | "Overbought" | "Neutral" | "Oversold" | "Extreme Oversold";
    rsi: number;
    signal: "Strong Sell" | "Sell" | "Hold" | "Buy" | "Strong Buy";
    details: string;
    price: number;
    time: string;
}
export interface RSISignal {
    type: string;
    time: number;
    price: number;
    rsi?: number;
    details: string;
}
export declare const renderRSIStatus: (pairName: string, rsiStatus: RSIStatus, bot: Bot, duration: string) => Promise<void>;
export declare const renderRSISignal: (pairName: string, signals: RSISignal | RSISignal[], bot: Bot, duration: string) => Promise<void>;
