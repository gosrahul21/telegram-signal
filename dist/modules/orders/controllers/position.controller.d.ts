import { PositionService } from '../services/position.service';
import { OrderSide } from '../orders.entity';
export declare class PositionController {
    private readonly positionService;
    constructor(positionService: PositionService);
    getActivePositions(req: any): Promise<{
        success: boolean;
        data: import("../services/position.service").Position[];
        count: number;
    }>;
    getPositionBySymbol(symbol: string, req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("../services/position.service").Position;
        message?: undefined;
    }>;
    getPositionStats(req: any): Promise<{
        success: boolean;
        data: {
            totalPositions: number;
            totalValue: number;
            totalUnrealizedPnl: number;
            totalRealizedPnl: number;
            totalPnL: number;
            positions: {
                symbol: string;
                side: OrderSide;
                quantity: number;
                averagePrice: number;
                currentPrice: number;
                unrealizedPnl: number;
                realizedPnl: number;
            }[];
        };
    }>;
    updatePositionPrice(body: {
        symbol: string;
        currentPrice: number;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("../services/position.service").Position;
        message: string;
    }>;
    closePosition(body: {
        symbol: string;
        closePrice: number;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("../services/position.service").Position;
        message: string;
    }>;
    getAllPositions(req: any): Promise<{
        success: boolean;
        data: import("../services/position.service").Position[];
        count: number;
    }>;
    getPositionsBySide(side: OrderSide, req: any): Promise<{
        success: boolean;
        data: import("../services/position.service").Position[];
        count: number;
    }>;
}
