import { TechnicalAnalysisService } from './technical-analysis.service';
export declare class BollingerBandsService {
    private readonly technicalAnalysisService;
    private readonly logger;
    constructor(technicalAnalysisService: TechnicalAnalysisService);
    checkBollingerBandsConditions(symbol: string, timeframe: string, conditions: any): Promise<{
        triggered: boolean;
        data: any;
        message: string;
    }>;
    private isBollingerBandsSqueeze;
    private isBollingerBandsExpansion;
    getBollingerBandsAnalysis(symbol: string, timeframe: string): Promise<{
        analysis: string;
        recommendation: string;
        risk: 'low' | 'medium' | 'high';
        data: any;
    }>;
}
