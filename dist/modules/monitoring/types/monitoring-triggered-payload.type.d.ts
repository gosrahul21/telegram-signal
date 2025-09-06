import { Monitoring } from '../entity/monitoring.entity';
import { TriggerData } from './trigger-data.type';
export type MonitoringTriggeredPayload = {
    monitoring: Monitoring;
    triggerData: TriggerData;
};
