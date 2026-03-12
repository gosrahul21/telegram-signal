"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeEngineModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const trade_engine_service_1 = require("./services/trade-engine.service");
const trade_engine_consumer_1 = require("./services/trade-engine.consumer");
const trade_engine_controller_1 = require("./controllers/trade-engine.controller");
let TradeEngineModule = class TradeEngineModule {
};
exports.TradeEngineModule = TradeEngineModule;
exports.TradeEngineModule = TradeEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule],
        controllers: [trade_engine_controller_1.TradeEngineController],
        providers: [trade_engine_service_1.TradeEngineService, trade_engine_consumer_1.TradeEngineConsumer],
        exports: [trade_engine_service_1.TradeEngineService],
    })
], TradeEngineModule);
//# sourceMappingURL=trade-engine.module.js.map