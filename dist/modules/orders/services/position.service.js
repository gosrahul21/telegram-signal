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
var PositionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_emitter_2 = require("@nestjs/event-emitter");
const eventsType_1 = require("../../../utils/constants/eventsType");
const orders_entity_1 = require("../orders.entity");
let PositionService = PositionService_1 = class PositionService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PositionService_1.name);
        this.positions = new Map();
    }
    async handleOrderExecuted(event) {
        try {
            const { orderId, userId, symbol, side, quantity, executedPrice } = event;
            this.logger.log(`Processing position for executed order: ${orderId} - ${side} ${quantity} ${symbol} @ $${executedPrice}`);
            const positionKey = `${userId}_${symbol}`;
            const existingPosition = this.positions.get(positionKey);
            if (!existingPosition) {
                const newPosition = {
                    id: `${userId}_${symbol}_${Date.now()}`,
                    userId,
                    symbol,
                    side,
                    quantity,
                    averagePrice: executedPrice,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                this.positions.set(positionKey, newPosition);
                this.logger.log(`Created new position: ${side} ${quantity} ${symbol} @ $${executedPrice}`);
                this.eventEmitter.emit(eventsType_1.EventsType.POSITION_CREATED, {
                    position: newPosition,
                    orderId,
                    timestamp: new Date(),
                });
            }
            else if (existingPosition.side === side) {
                const totalQuantity = existingPosition.quantity + quantity;
                const totalValue = existingPosition.quantity * existingPosition.averagePrice +
                    quantity * executedPrice;
                const newAveragePrice = totalValue / totalQuantity;
                existingPosition.quantity = totalQuantity;
                existingPosition.averagePrice = newAveragePrice;
                existingPosition.updatedAt = new Date();
                this.logger.log(`Increased position: ${existingPosition.quantity} ${symbol} @ $${newAveragePrice}`);
                this.eventEmitter.emit(eventsType_1.EventsType.POSITION_UPDATED, {
                    position: existingPosition,
                    orderId,
                    action: 'INCREASED',
                    timestamp: new Date(),
                });
            }
            else {
                if (quantity >= existingPosition.quantity) {
                    const remainingQuantity = quantity - existingPosition.quantity;
                    const realizedPnl = this.calculatePnL(existingPosition.side, existingPosition.quantity, existingPosition.averagePrice, executedPrice);
                    existingPosition.quantity = 0;
                    existingPosition.realizedPnl =
                        (existingPosition.realizedPnl || 0) + realizedPnl;
                    existingPosition.updatedAt = new Date();
                    this.logger.log(`Closed position: PnL $${realizedPnl.toFixed(2)}`);
                    this.eventEmitter.emit(eventsType_1.EventsType.POSITION_CLOSED, {
                        position: existingPosition,
                        orderId,
                        realizedPnl,
                        timestamp: new Date(),
                    });
                    if (remainingQuantity > 0) {
                        const newPosition = {
                            id: `${userId}_${symbol}_${Date.now()}`,
                            userId,
                            symbol,
                            side,
                            quantity: remainingQuantity,
                            averagePrice: executedPrice,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        this.positions.set(positionKey, newPosition);
                        this.logger.log(`Created new position after reversal: ${side} ${remainingQuantity} ${symbol} @ $${executedPrice}`);
                        this.eventEmitter.emit(eventsType_1.EventsType.POSITION_CREATED, {
                            position: newPosition,
                            orderId,
                            timestamp: new Date(),
                        });
                    }
                }
                else {
                    const realizedPnl = this.calculatePnL(existingPosition.side, quantity, existingPosition.averagePrice, executedPrice);
                    existingPosition.quantity -= quantity;
                    existingPosition.realizedPnl =
                        (existingPosition.realizedPnl || 0) + realizedPnl;
                    existingPosition.updatedAt = new Date();
                    this.logger.log(`Reduced position: ${existingPosition.quantity} ${symbol}, PnL $${realizedPnl.toFixed(2)}`);
                    this.eventEmitter.emit(eventsType_1.EventsType.POSITION_UPDATED, {
                        position: existingPosition,
                        orderId,
                        action: 'REDUCED',
                        realizedPnl,
                        timestamp: new Date(),
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Error handling order execution: ${error.message}`, error.stack);
        }
    }
    calculatePnL(side, quantity, openPrice, closePrice) {
        if (side === orders_entity_1.OrderSide.BUY) {
            return (closePrice - openPrice) * quantity;
        }
        else {
            return (openPrice - closePrice) * quantity;
        }
    }
    getPosition(userId, symbol) {
        const positionKey = `${userId}_${symbol}`;
        return this.positions.get(positionKey) || null;
    }
    getUserPositions(userId) {
        return Array.from(this.positions.values()).filter((position) => position.userId === userId && position.quantity > 0);
    }
    getAllPositions() {
        return Array.from(this.positions.values()).filter((position) => position.quantity > 0);
    }
    updatePositionPrice(userId, symbol, currentPrice) {
        const positionKey = `${userId}_${symbol}`;
        const position = this.positions.get(positionKey);
        if (position && position.quantity > 0) {
            position.currentPrice = currentPrice;
            position.unrealizedPnl = this.calculatePnL(position.side, position.quantity, position.averagePrice, currentPrice);
            position.updatedAt = new Date();
            return position;
        }
        return null;
    }
    closePosition(userId, symbol, closePrice) {
        const positionKey = `${userId}_${symbol}`;
        const position = this.positions.get(positionKey);
        if (position && position.quantity > 0) {
            const realizedPnl = this.calculatePnL(position.side, position.quantity, position.averagePrice, closePrice);
            position.quantity = 0;
            position.realizedPnl = (position.realizedPnl || 0) + realizedPnl;
            position.updatedAt = new Date();
            this.logger.log(`Position closed manually: ${symbol}, PnL $${realizedPnl.toFixed(2)}`);
            this.eventEmitter.emit(eventsType_1.EventsType.POSITION_CLOSED, {
                position,
                realizedPnl,
                timestamp: new Date(),
            });
            return position;
        }
        return null;
    }
    getUserPositionStats(userId) {
        const positions = this.getUserPositions(userId);
        const totalValue = positions.reduce((sum, pos) => sum + pos.quantity * (pos.currentPrice || pos.averagePrice), 0);
        const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + (pos.unrealizedPnl || 0), 0);
        const totalRealizedPnl = positions.reduce((sum, pos) => sum + (pos.realizedPnl || 0), 0);
        return {
            totalPositions: positions.length,
            totalValue,
            totalUnrealizedPnl,
            totalRealizedPnl,
            totalPnL: totalUnrealizedPnl + totalRealizedPnl,
            positions: positions.map((pos) => ({
                symbol: pos.symbol,
                side: pos.side,
                quantity: pos.quantity,
                averagePrice: pos.averagePrice,
                currentPrice: pos.currentPrice,
                unrealizedPnl: pos.unrealizedPnl,
                realizedPnl: pos.realizedPnl,
            })),
        };
    }
};
exports.PositionService = PositionService;
__decorate([
    (0, event_emitter_2.OnEvent)(eventsType_1.EventsType.ORDER_EXECUTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PositionService.prototype, "handleOrderExecuted", null);
exports.PositionService = PositionService = PositionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], PositionService);
//# sourceMappingURL=position.service.js.map