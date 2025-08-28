import { RSIAnalysisService } from '@/services/processRSISignal';
export declare class CommandHandlerService {
    private readonly rsiAnalysisService;
    constructor(rsiAnalysisService: RSIAnalysisService);
    getStatusByDurationHandler(ctx: any, duration: '1h' | '4h' | '1d'): Promise<void>;
    private handleStatusByDuration;
}
