import { Bot } from 'grammy';
import { Duration, UpstoxInterval } from '@/types/Duration';
export declare const processRSIAnalysis: (bot: Bot, fallbackKeyPairs: string[], duration: Duration | UpstoxInterval, neutral?: boolean) => Promise<void>;
export default processRSIAnalysis;
