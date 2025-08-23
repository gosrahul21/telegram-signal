import { PriceMonitoringService } from './price-monitoring.service';
export declare class TechnicalAnalysisService {
    private readonly priceMonitoringService;
    private readonly logger;
    constructor(priceMonitoringService: PriceMonitoringService);
    getBollingerBands(symbol: string, timeframe: string, period?: number, stdDev?: number): Promise<any>;
    getEMACrossover(symbol: string, timeframe: string, fastPeriod?: number, slowPeriod?: number): Promise<any>;
    getRSI(symbol: string, timeframe: string, period?: number): Promise<any>;
    getMACD(symbol: string, timeframe: string, fastPeriod?: number, slowPeriod?: number, signalPeriod?: number): Promise<any>;
    getStochastic(symbol: string, timeframe: string, kPeriod?: number, dPeriod?: number): Promise<any>;
    getVolumeAnalysis(symbol: string, timeframe: string, period?: number): Promise<any>;
    getPriceAction(symbol: string, timeframe: string, period?: number): Promise<any>;
    private calculateSMA;
    private calculateEMA;
    private calculateVariance;
    private detectCrossover;
    private detectPricePatterns;
    private isDoubleTop;
    private isDoubleBottom;
    private isHeadAndShoulders;
    private isTriangle;
    private findPeaks;
    private findTroughs;
    private findSupportLevel;
    private findResistanceLevel;
}
