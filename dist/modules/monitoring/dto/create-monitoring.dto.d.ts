import { MonitorEventType, Timeframe } from "@/modules/alert/alert.entity";
export declare class CreateMonitoringDto {
    symbol: string;
    timeframe: Timeframe;
    eventType: MonitorEventType;
    count: string;
}
