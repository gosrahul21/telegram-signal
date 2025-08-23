import { TechnicalAnalysisService } from './technical-analysis.service';
export declare class EMAService {
    private readonly technicalAnalysisService;
    private readonly logger;
    constructor(technicalAnalysisService: TechnicalAnalysisService);
    checkEMACrossoverConditions(symbol: string, timeframe: string, conditions: any): Promise<{
        triggered: boolean;
        data: any;
        message: string;
    }>;
    private checkTrendStrength;
    getEMAAnalysis(symbol: string, timeframe: string): Promise<{
        analysis: string;
        recommendation: string;
        risk: 'low' | 'medium' | 'high';
        data: any;
    }>;
    getEMASignals(symbol: string, timeframe: string): Promise<{
        signals: string[];
        strength: 'weak' | 'moderate' | 'strong';
        data: any;
    }>;
    getEMALevels(symbol: string, timeframe: string): Promise<{
        fastEMA: number;
        slowEMA: number;
        distance: number;
        distancePercent: number;
        data: any;
    }>;
    getMultipleEMAs(symbol: string, timeframe: string, periods?: number[]): Promise<{
        emas: Record<string, number>;
        analysis: string;
        data: any;
    }>;
}
