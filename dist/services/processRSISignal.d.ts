import { Bot } from 'grammy';
import { RSISignal } from '../bot/utils/renderRSISignal';
import { Duration, UpstoxInterval } from '@/utils/types/Duration';
import { BinancePriceApiService } from './binance-price-api.service';
import { TechnicalIndicatorsService } from '@/utils/helper/techincalIndicators';
export declare class RSIAnalysisService {
    private readonly binancePriceApiService;
    private readonly technicalIndicatorsService;
    constructor(binancePriceApiService: BinancePriceApiService, technicalIndicatorsService: TechnicalIndicatorsService);
    processRSIAnalysis: (bot: Bot, fallbackKeyPairs: string[], duration: Duration | UpstoxInterval, neutral?: boolean) => Promise<void>;
    generateRSISignal: (keyName: string, candles: any, neutral?: boolean) => RSISignal[];
    getRSIValue: (candles: any) => number;
    private rsiSignal;
}
