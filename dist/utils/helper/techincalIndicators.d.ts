export declare class TechnicalIndicatorsService {
    constructor();
    calculateEMA(prices: number[], period: number): any;
    calculateRSI(prices: number[], period?: number): any;
    calculateMACD(prices: number[]): any;
}
export declare const technicalIndicatorsService: TechnicalIndicatorsService;
