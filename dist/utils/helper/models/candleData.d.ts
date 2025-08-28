export interface CandleData {
    closeTime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    openInterest: number;
}
export declare function CandleDataModal(apiResponse: any): CandleData[];
