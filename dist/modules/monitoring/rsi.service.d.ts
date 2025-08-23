import { TechnicalAnalysisService } from './technical-analysis.service';
export declare class RSIService {
    private readonly technicalAnalysisService;
    private readonly logger;
    constructor(technicalAnalysisService: TechnicalAnalysisService);
    checkRSIConditions(symbol: string, timeframe: string, conditions: any): Promise<{
        triggered: boolean;
        data: any;
        message: string;
    }>;
    private checkRSIDivergence;
    private checkRSIMomentum;
    getRSIAnalysis(symbol: string, timeframe: string): Promise<{
        analysis: string;
        recommendation: string;
        risk: 'low' | 'medium' | 'high';
        data: any;
    }>;
    getRSISignals(symbol: string, timeframe: string): Promise<{
        signals: string[];
        strength: 'weak' | 'moderate' | 'strong';
        data: any;
    }>;
    getRSILevels(symbol: string, timeframe: string): Promise<{
        oversold: number;
        overbought: number;
        neutral: {
            low: number;
            high: number;
        };
        data: any;
    }>;
}
