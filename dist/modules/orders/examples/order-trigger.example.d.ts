import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersService } from '../orders.service';
import { PositionService } from '../services/position.service';
export declare class OrderTriggerExample {
    private readonly ordersService;
    private readonly positionService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(ordersService: OrdersService, positionService: PositionService, eventEmitter: EventEmitter2);
    demonstrateOrderTriggerFlow(): Promise<void>;
    demonstratePositionManagement(): Promise<void>;
    demonstratePositionClosure(): Promise<void>;
    demonstrateErrorHandling(): Promise<void>;
    runAllExamples(): Promise<void>;
}
