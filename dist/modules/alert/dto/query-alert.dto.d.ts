import { AlertType, Timeframe } from '../alert.entity';
export declare class QueryAlertDto {
    symbol?: string;
    userId?: string;
    type?: AlertType;
    timeframe?: Timeframe;
    isActive?: boolean;
    tags?: string[];
    search?: string;
}
