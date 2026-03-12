"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PositionManagementExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionManagementExample = void 0;
const common_1 = require("@nestjs/common");
const position_management_service_1 = require("../services/position-management.service");
const orders_entity_1 = require("../orders.entity");
let PositionManagementExample = PositionManagementExample_1 = class PositionManagementExample {
    constructor(positionManagementService) {
        this.positionManagementService = positionManagementService;
        this.logger = new common_1.Logger(PositionManagementExample_1.name);
    }
    async demonstratePositionManagement() {
        const userId = 'user123';
        const symbol = 'BTCUSDT';
        this.logger.log('=== Position Management Demo ===');
        this.logger.log('1. Executing first order: BUY 1 BTC @ $50,000');
        const result1 = await this.positionManagementService.executeOrderManually('order1', userId, symbol, orders_entity_1.OrderSide.BUY, 1, 50000, 'binance');
        this.logger.log(`Result: ${result1.action} - ${result1.message}`);
        this.logger.log('2. Executing second order: BUY 0.5 BTC @ $51,000');
        const result2 = await this.positionManagementService.executeOrderManually('order2', userId, symbol, orders_entity_1.OrderSide.BUY, 0.5, 51000, 'binance');
        this.logger.log(`Result: ${result2.action} - ${result2.message}`);
        this.logger.log('3. Executing third order: SELL 0.3 BTC @ $52,000');
        const result3 = await this.positionManagementService.executeOrderManually('order3', userId, symbol, orders_entity_1.OrderSide.SELL, 0.3, 52000, 'binance');
        this.logger.log(`Result: ${result3.action} - ${result3.message}`);
        this.logger.log('4. Executing fourth order: SELL 1.5 BTC @ $53,000');
        const result4 = await this.positionManagementService.executeOrderManually('order4', userId, symbol, orders_entity_1.OrderSide.SELL, 1.5, 53000, 'binance');
        this.logger.log(`Result: ${result4.action} - ${result4.message}`);
        this.logger.log('5. Getting position summary...');
        const summary = await this.positionManagementService.getUserPositionSummary(userId);
        this.logger.log('Position Summary:', JSON.stringify(summary, null, 2));
    }
    async demonstrateStopLossAndTakeProfit() {
        const userId = 'user456';
        const symbol = 'ETHUSDT';
        this.logger.log('=== Stop Loss & Take Profit Demo ===');
        this.logger.log('1. Opening long position: BUY 10 ETH @ $3,000');
        const longResult = await this.positionManagementService.executeOrderManually('order5', userId, symbol, orders_entity_1.OrderSide.BUY, 10, 3000, 'binance');
        this.logger.log(`Result: ${longResult.action} - ${longResult.message}`);
        this.logger.log('2. Stop loss triggered at $2,800');
        const stopLossResult = await this.positionManagementService.handleStopLossTrigger('order5', userId, symbol, 2800);
        this.logger.log(`Stop Loss Result: ${stopLossResult?.message}`);
        this.logger.log('3. Opening new position: BUY 5 ETH @ $2,900');
        const newResult = await this.positionManagementService.executeOrderManually('order6', userId, symbol, orders_entity_1.OrderSide.BUY, 5, 2900, 'binance');
        this.logger.log(`Result: ${newResult.action} - ${newResult.message}`);
        this.logger.log('4. Take profit triggered at $3,200');
        const takeProfitResult = await this.positionManagementService.handleTakeProfitTrigger('order6', userId, symbol, 3200);
        this.logger.log(`Take Profit Result: ${takeProfitResult?.message}`);
    }
    async demonstratePositionCalculations() {
        const userId = 'user789';
        const symbol = 'SOLUSDT';
        this.logger.log('=== Position Calculations Demo ===');
        this.logger.log('1. Opening position: BUY 100 SOL @ $100');
        await this.positionManagementService.executeOrderManually('order7', userId, symbol, orders_entity_1.OrderSide.BUY, 100, 100, 'binance');
        const prices = [95, 100, 105, 110, 120];
        for (const price of prices) {
            const metrics = await this.positionManagementService.calculatePositionPnL('order7', price);
            this.logger.log(`Price: $${price} | PnL: $${metrics.unrealizedPnl.toFixed(2)} | PnL%: ${metrics.unrealizedPnlPercentage.toFixed(2)}%`);
        }
        const summary = await this.positionManagementService.getUserPositionSummary(userId);
        this.logger.log('Final Summary:', JSON.stringify(summary, null, 2));
    }
    async demonstrateMultiSymbolTrading() {
        const userId = 'user101';
        const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
        this.logger.log('=== Multi-Symbol Trading Demo ===');
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const prices = [50000, 3000, 1];
            this.logger.log(`${i + 1}. Opening position: BUY 1 ${symbol} @ $${prices[i]}`);
            const result = await this.positionManagementService.executeOrderManually(`order${8 + i}`, userId, symbol, orders_entity_1.OrderSide.BUY, 1, prices[i], 'binance');
            this.logger.log(`Result: ${result.action} - ${result.message}`);
        }
        const summary = await this.positionManagementService.getUserPositionSummary(userId);
        this.logger.log('Multi-Symbol Summary:', JSON.stringify(summary, null, 2));
    }
    async demonstrateEdgeCases() {
        const userId = 'user202';
        const symbol = 'DOGEUSDT';
        this.logger.log('=== Edge Cases Demo ===');
        try {
            this.logger.log('1. Attempting to close non-existent position...');
            await this.positionManagementService.closePosition('non-existent', 0.1);
        }
        catch (error) {
            this.logger.log(`Expected error: ${error.message}`);
        }
        this.logger.log('2. Opening and closing position...');
        await this.positionManagementService.executeOrderManually('order11', userId, symbol, orders_entity_1.OrderSide.BUY, 1000, 0.1, 'binance');
        const positions = await this.positionManagementService.getUserActivePositions(userId);
        if (positions.length > 0) {
            const position = positions[0];
            this.logger.log(`3. Closing position ${position._id} at $0.12`);
            const closeResult = await this.positionManagementService.closePosition(position._id.toString(), 0.12);
            this.logger.log(`Close Result: ${closeResult.message}`);
        }
        const summary = await this.positionManagementService.getUserPositionSummary(userId);
        this.logger.log('Edge Cases Summary:', JSON.stringify(summary, null, 2));
    }
    async runAllExamples() {
        try {
            await this.demonstratePositionManagement();
            await this.demonstrateStopLossAndTakeProfit();
            await this.demonstratePositionCalculations();
            await this.demonstrateMultiSymbolTrading();
            await this.demonstrateEdgeCases();
            this.logger.log('=== All Examples Completed Successfully ===');
        }
        catch (error) {
            this.logger.error('Error running examples:', error);
        }
    }
};
exports.PositionManagementExample = PositionManagementExample;
exports.PositionManagementExample = PositionManagementExample = PositionManagementExample_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [position_management_service_1.PositionManagementService])
], PositionManagementExample);
//# sourceMappingURL=position-management.example.js.map