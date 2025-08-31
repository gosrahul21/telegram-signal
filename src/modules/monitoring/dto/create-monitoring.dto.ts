import { MonitorEventType, Timeframe } from "@/modules/alert/alert.entity";

export class CreateMonitoringDto {  
    symbol: string;
    timeframe: Timeframe;
    eventType: MonitorEventType;
    count: string; // number type string for infinite monitoring
}