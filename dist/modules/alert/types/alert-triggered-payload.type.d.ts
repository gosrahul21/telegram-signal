import { MonitoringTriggeredPayload } from '../../monitoring/types/monitoring-triggered-payload.type';
import { Types } from 'mongoose';
export type AlertTriggeredUserPayload = MonitoringTriggeredPayload & {
    alertId: string;
    userId: Types.ObjectId;
    count: number;
};
export type AlertTriggeredOrderPayload = AlertTriggeredUserPayload & {
    orderId: string;
};
