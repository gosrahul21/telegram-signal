interface CreateFuturesOrderParams {
    side: "buy" | "sell";
    pair: string;
    order_type: "market_order" | "limit_order" | "stop_limit" | "stop_market" | "take_profit_limit" | "take_profit_market";
    price?: number;
    stop_price?: number;
    total_quantity: number;
    leverage?: number;
    notification?: "no_notification" | "email_notification";
    time_in_force?: "good_till_cancel" | "fill_or_kill" | "immediate_or_cancel";
    margin_currency_short_name?: "INR" | "USDT";
    position_margin_type?: "isolated" | "crossed";
    take_profit_price?: number;
    stop_loss_price?: number;
}
interface CancelOrderParams {
    orderId: string;
}
interface EditFuturesOrderParams {
    orderId: string;
    total_quantity: number;
    price: number;
    take_profit_price?: number;
    stop_loss_price?: number;
}
interface UpdateTakeProfitParams {
    orderId: string;
    take_profit_price: number;
}
interface UpdateStopLossParams {
    orderId: string;
    stop_loss_price: number;
}
interface GetOrdersParams {
    status: "open" | "filled" | "partially_filled" | "partially_cancelled" | "cancelled" | "rejected" | "untriggered";
    side: "buy" | "sell";
    page: string;
    size: string;
    margin_currency_short_name?: ("INR" | "USDT")[];
}
export declare class CoindcxService {
    private readonly baseurl;
    private readonly apiKey;
    private readonly secretKey;
    constructor();
    private getTimestamp;
    private getHeaders;
    getPositions(): Promise<any>;
    createFuturesOrder({ side, pair, order_type, price, stop_price, total_quantity, leverage, notification, time_in_force, margin_currency_short_name, position_margin_type, take_profit_price, stop_loss_price, }: CreateFuturesOrderParams): Promise<any>;
    cancelOrder({ orderId }: CancelOrderParams): Promise<any>;
    getWalletDetails(): Promise<any>;
    editFuturesOrder({ orderId, total_quantity, price, take_profit_price, stop_loss_price, }: EditFuturesOrderParams): Promise<any>;
    updateTakeProfit({ orderId, take_profit_price, }: UpdateTakeProfitParams): Promise<any>;
    updateStopLoss({ orderId, stop_loss_price }: UpdateStopLossParams): Promise<any>;
    getOrders({ status, side, page, size, margin_currency_short_name, }: GetOrdersParams): Promise<any>;
}
export {};
