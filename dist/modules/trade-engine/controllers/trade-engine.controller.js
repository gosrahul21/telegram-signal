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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeEngineController = void 0;
const common_1 = require("@nestjs/common");
const trade_engine_service_1 = require("../services/trade-engine.service");
let TradeEngineController = class TradeEngineController {
    constructor(tradeEngineService) {
        this.tradeEngineService = tradeEngineService;
    }
    async removePriceLimit(limitId) {
        const removed = this.tradeEngineService.removePriceLimit(limitId);
        return {
            success: removed,
            message: removed
                ? 'Price limit removed successfully'
                : 'Price limit not found',
        };
    }
    async getCurrentPrice(symbol) {
        console.log('getCurrentPrice', symbol);
        const price = await this.tradeEngineService.getCurrentPrice(symbol);
        return {
            symbol,
            price,
            timestamp: new Date(),
        };
    }
    async getActivePriceLimits() {
        const limits = this.tradeEngineService.getActivePriceLimits();
        return {
            limits,
            count: limits.length,
        };
    }
    async getPriceLimitsForSymbol(symbol) {
        const limits = this.tradeEngineService.getPriceLimitsForSymbol(symbol);
        return {
            symbol,
            limits,
            count: limits.length,
        };
    }
    async getConnectionStatus() {
        const status = this.tradeEngineService.getConnectionStatus();
        return {
            ...status,
            timestamp: new Date(),
        };
    }
    async subscribeToSymbol(symbol) {
        this.tradeEngineService.subscribeToSymbol(symbol);
        return {
            symbol,
            message: 'Subscribed to symbol successfully',
        };
    }
    async unsubscribeFromSymbol(symbol) {
        this.tradeEngineService.unsubscribeFromSymbol(symbol);
        return {
            symbol,
            message: 'Unsubscribed from symbol successfully',
        };
    }
    async testPriceLimit(body) {
        const currentPrice = await this.tradeEngineService.getCurrentPrice(body.symbol);
        if (!currentPrice) {
            return {
                error: 'Could not fetch current price',
                symbol: body.symbol,
            };
        }
        let isTriggered = false;
        switch (body.condition) {
            case 'ABOVE':
                isTriggered = currentPrice > body.limitPrice;
                break;
            case 'BELOW':
                isTriggered = currentPrice < body.limitPrice;
                break;
            case 'EQUAL':
                isTriggered =
                    Math.abs(currentPrice - body.limitPrice) < body.limitPrice * 0.001;
                break;
        }
        return {
            symbol: body.symbol,
            currentPrice,
            limitPrice: body.limitPrice,
            condition: body.condition,
            isTriggered,
            difference: currentPrice - body.limitPrice,
            percentageDifference: ((currentPrice - body.limitPrice) / body.limitPrice) * 100,
        };
    }
};
exports.TradeEngineController = TradeEngineController;
__decorate([
    (0, common_1.Delete)('price-limits/:limitId'),
    __param(0, (0, common_1.Param)('limitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TradeEngineController.prototype, "removePriceLimit", null);
__decorate([
    (0, common_1.Get)('price/:symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TradeEngineController.prototype, "getCurrentPrice", null);
__decorate([
    (0, common_1.Get)('price-limits'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradeEngineController.prototype, "getActivePriceLimits", null);
__decorate([
    (0, common_1.Get)('price-limits/symbol/:symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TradeEngineController.prototype, "getPriceLimitsForSymbol", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradeEngineController.prototype, "getConnectionStatus", null);
__decorate([
    (0, common_1.Get)('subscribe/:symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TradeEngineController.prototype, "subscribeToSymbol", null);
__decorate([
    (0, common_1.Post)('unsubscribe/:symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TradeEngineController.prototype, "unsubscribeFromSymbol", null);
__decorate([
    (0, common_1.Post)('test-price-limit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradeEngineController.prototype, "testPriceLimit", null);
exports.TradeEngineController = TradeEngineController = __decorate([
    (0, common_1.Controller)('trade-engine'),
    __metadata("design:paramtypes", [trade_engine_service_1.TradeEngineService])
], TradeEngineController);
//# sourceMappingURL=trade-engine.controller.js.map