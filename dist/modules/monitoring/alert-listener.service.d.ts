import { AlertCreatedEvent, AlertDeletedEvent, AlertUpdatedEvent } from '../alert';
import { MonitoringService } from './monitoring.service';
export declare class AlertListenerService {
    private readonly monitoringService;
    private readonly logger;
    constructor(monitoringService: MonitoringService);
    handleAlertCreated(event: AlertCreatedEvent): Promise<void>;
    handleAlertUpdated(event: AlertUpdatedEvent): Promise<void>;
    handleAlertDeleted(alert: AlertDeletedEvent): Promise<void>;
}
