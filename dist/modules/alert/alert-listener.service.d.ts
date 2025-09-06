import { AlertService } from './alert.service';
import { MonitoringTriggeredPayload } from '../monitoring/types';
export declare class AlertListenerService {
    private readonly alertService;
    private readonly logger;
    constructor(alertService: AlertService);
    handleMonitoringTriggered(payload: MonitoringTriggeredPayload): Promise<void>;
    handleOrderEvents(payload: any): Promise<void>;
}
