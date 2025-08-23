import { AlertService } from './alert.service';
import { AlertUpdatedEvent, AlertDeletedEvent, AlertTriggeredEvent, AlertStatusChangedEvent } from './events/alert.events';
export declare class AlertListenerService {
    private readonly alertService;
    private readonly logger;
    constructor(alertService: AlertService);
    handleAlertUpdated(event: AlertUpdatedEvent): void;
    handleAlertDeleted(event: AlertDeletedEvent): void;
    handleAlertTriggered(event: AlertTriggeredEvent): void;
    handleAlertStatusChanged(event: AlertStatusChangedEvent): void;
    private notifyUserAboutNewAlert;
    private startMonitoringAlert;
    private logToExternalService;
    private checkForCriticalChanges;
    private updateMonitoringConfiguration;
    private stopMonitoringAlert;
    private cleanupAlertResources;
    private sendAlertNotification;
    private executeTradingLogic;
    private updateAlertAnalytics;
    private activateAlertMonitoring;
    private deactivateAlertMonitoring;
}
