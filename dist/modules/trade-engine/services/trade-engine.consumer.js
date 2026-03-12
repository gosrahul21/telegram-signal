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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeEngineConsumer = void 0;
const common_1 = require("@nestjs/common");
const eventsType_1 = require("../../../utils/constants/eventsType");
const event_emitter_1 = require("@nestjs/event-emitter");
const trade_engine_service_1 = require("./trade-engine.service");
let TradeEngineConsumer = class TradeEngineConsumer {
    constructor(tradeEngineService) {
        this.tradeEngineService = tradeEngineService;
    }
    async handleOrderCreated(event) {
        this.tradeEngineService.handleTradeEngineEvent(event);
    }
    async handleOrderUpdated(event) {
        this.tradeEngineService.handleTradeEngineEvent(event);
    }
    async handlePriceLimitTriggered(event) {
        console.log(`Price limit triggered: ${event.limitId} - ${event.limit.symbol} ${event.limit.condition} ${event.limit.limitPrice} at ${event.priceUpdate.price}`);
    }
};
exports.TradeEngineConsumer = TradeEngineConsumer;
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ORDER_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradeEngineConsumer.prototype, "handleOrderCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ORDER_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradeEngineConsumer.prototype, "handleOrderUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.PRICE_LIMIT_TRIGGERED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradeEngineConsumer.prototype, "handlePriceLimitTriggered", null);
exports.TradeEngineConsumer = TradeEngineConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [trade_engine_service_1.TradeEngineService])
], TradeEngineConsumer);
//# sourceMappingURL=trade-engine.consumer.js.map