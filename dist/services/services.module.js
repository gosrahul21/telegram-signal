"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesModule = void 0;
const common_1 = require("@nestjs/common");
const coindcx_module_1 = require("./coindcx/coindcx.module");
const price_api_module_1 = require("./price-api/price-api.module");
const order_module_1 = require("./order/order.module");
const signals_module_1 = require("./signals/signals.module");
const user_service_module_1 = require("./user-service/user-service.module");
const openai_module_1 = require("./openai/openai.module");
const upstox_api_module_1 = require("./upstox-api/upstox-api.module");
const process_rsi_signal_module_1 = require("./process-rsi-signal/process-rsi-signal.module");
const get_stock_historical_candles_module_1 = require("./get-stock-historical-candles/get-stock-historical-candles.module");
let ServicesModule = class ServicesModule {
};
exports.ServicesModule = ServicesModule;
exports.ServicesModule = ServicesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            coindcx_module_1.CoindcxModule,
            price_api_module_1.PriceApiModule,
            order_module_1.OrderModule,
            signals_module_1.SignalsModule,
            user_service_module_1.UserServiceModule,
            openai_module_1.OpenAIModule,
            upstox_api_module_1.UpstoxApiModule,
            process_rsi_signal_module_1.ProcessRSISignalModule,
            get_stock_historical_candles_module_1.GetStockHistoricalCandlesModule,
        ],
    })
], ServicesModule);
//# sourceMappingURL=services.module.js.map