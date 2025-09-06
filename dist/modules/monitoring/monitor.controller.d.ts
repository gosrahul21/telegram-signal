import { MonitoringService } from './services/monitoring.service';
export declare class MonitorController {
    private readonly monitorService;
    constructor(monitorService: MonitoringService);
    getRsiStatus(): Promise<void>;
    getBollingerBandsStatus(): Promise<void>;
    getMacdStatus(): Promise<void>;
}
