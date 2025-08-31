import { MonitorEventType, Timeframe } from '../alert.entity';
export declare class CreateAlertDto {
    symbol: string;
    type: MonitorEventType;
    count: number;
    infinite?: boolean;
    timeframe: Timeframe;
    conditions?: Record<string, any>;
    description?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    userId?: string;
}
