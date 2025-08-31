import { AlertService } from './alert.service';
export declare class AlertListenerService {
    private readonly alertService;
    private readonly logger;
    constructor(alertService: AlertService);
    handleMonitoringTriggered(payload: any): Promise<void>;
    handleOrderEvents(payload: any): Promise<void>;
}
