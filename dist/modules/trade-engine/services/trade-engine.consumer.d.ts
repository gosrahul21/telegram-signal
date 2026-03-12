import { TradeEngineService } from './trade-engine.service';
export declare class TradeEngineConsumer {
    private readonly tradeEngineService;
    constructor(tradeEngineService: TradeEngineService);
    handleOrderCreated(event: any): Promise<void>;
    handleOrderUpdated(event: any): Promise<void>;
    handlePriceLimitTriggered(event: any): Promise<void>;
}
