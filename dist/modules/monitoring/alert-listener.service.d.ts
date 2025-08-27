import { AlertCreatedEvent, AlertDeletedEvent, AlertStatusChangedEvent, AlertUpdatedEvent } from '../alert';
import { MonitoringService } from './monitoring.service';
export declare class AlertListenerService {
    private readonly monitoringService;
    private readonly logger;
    constructor(monitoringService: MonitoringService);
    handleAlertCreated(event: AlertCreatedEvent): Promise<void>;
    handleAlertUpdated(event: AlertUpdatedEvent & any): Promise<void>;
    handleAlertDeleted(event: AlertDeletedEvent): Promise<void>;
    handleAlertStatusChanged(event: AlertStatusChangedEvent & any): Promise<void>;
}
