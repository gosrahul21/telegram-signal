import { PriceMonitoringService } from './price-monitoring.service';
export interface BollingerBandsResult {
    upperBand: number;
    lowerBand: number;
    middleBand: number;
    standardDeviation: number;
    period: number;
    stdDev: number;
    timestamp: Date;
}
export interface EMACrossoverResult {
    fastEMA: number;
    slowEMA: number;
    previousFastEMA: number;
    previousSlowEMA: number;
    fastPeriod: number;
    slowPeriod: number;
    crossover: string | null;
    timestamp: Date;
}
export interface RSIResult {
    rsi: number;
    period: number;
    avgGain: number;
    avgLoss: number;
    rs: number;
    timestamp: Date;
}
export interface MACDResult {
    macd: number;
    signal: number;
    histogram: number;
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    timestamp: Date;
}
export interface StochasticResult {
    k: number;
    d: number;
    kPeriod: number;
    dPeriod: number;
    timestamp: Date;
}
export interface VolumeAnalysisResult {
    currentVolume: number;
    avgVolume: number;
    volumeRatio: number;
    period: number;
    timestamp: Date;
}
export interface PriceActionResult {
    patterns: string[];
    support: number;
    resistance: number;
    period: number;
    timestamp: Date;
}
export declare class TechnicalAnalysisService {
    private readonly priceMonitoringService;
    private readonly logger;
    constructor(priceMonitoringService: PriceMonitoringService);
    getBollingerBands(symbol: string, timeframe: string, period?: number, stdDev?: number): Promise<BollingerBandsResult>;
    getEMACrossover(symbol: string, timeframe: string, fastPeriod?: number, slowPeriod?: number): Promise<EMACrossoverResult>;
    getRSI(symbol: string, timeframe: string, period?: number): Promise<RSIResult>;
    getMACD(symbol: string, timeframe: string, fastPeriod?: number, slowPeriod?: number, signalPeriod?: number): Promise<MACDResult>;
    getStochastic(symbol: string, timeframe: string, kPeriod?: number, dPeriod?: number): Promise<StochasticResult>;
    getPriceAction(symbol: string, timeframe: string, period?: number): Promise<PriceActionResult>;
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
