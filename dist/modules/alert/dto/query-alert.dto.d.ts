import { MonitorEventType, Timeframe } from '../alert.entity';
export declare class QueryAlertDto {
    symbol?: string;
    userId?: string;
    type?: MonitorEventType;
    timeframe?: Timeframe;
    isActive?: boolean;
    tags?: string[];
    search?: string;
}
