import { TechnicalAnalysisService } from './technical-analysis.service';
export declare class MACDService {
    private readonly technicalAnalysisService;
    private readonly logger;
    constructor(technicalAnalysisService: TechnicalAnalysisService);
    checkMACDConditions(symbol: string, timeframe: string, conditions: any): Promise<{
        triggered: boolean;
        data: any;
        message: string;
    }>;
    private checkMACDDivergence;
    getMACDAnalysis(symbol: string, timeframe: string): Promise<{
        analysis: string;
        recommendation: string;
        risk: 'low' | 'medium' | 'high';
        data: any;
    }>;
    getMACDSignals(symbol: string, timeframe: string): Promise<{
        signals: string[];
        strength: 'weak' | 'moderate' | 'strong';
        data: any;
    }>;
}
