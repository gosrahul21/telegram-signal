import { PositionManagementService } from '../services/position-management.service';
export declare class PositionManagementExample {
    private readonly positionManagementService;
    private readonly logger;
    constructor(positionManagementService: PositionManagementService);
    demonstratePositionManagement(): Promise<void>;
    demonstrateStopLossAndTakeProfit(): Promise<void>;
    demonstratePositionCalculations(): Promise<void>;
    demonstrateMultiSymbolTrading(): Promise<void>;
    demonstrateEdgeCases(): Promise<void>;
    runAllExamples(): Promise<void>;
}
