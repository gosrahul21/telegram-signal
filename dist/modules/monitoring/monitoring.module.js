"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const monitoring_service_1 = require("./monitoring.service");
const technical_analysis_service_1 = require("./technical-analysis.service");
const price_monitoring_service_1 = require("./price-monitoring.service");
const bollinger_bands_service_1 = require("./bollinger-bands.service");
const macd_service_1 = require("./macd.service");
const rsi_service_1 = require("./rsi.service");
const ema_service_1 = require("./ema.service");
const notification_service_1 = require("./notification.service");
const alert_module_1 = require("../alert/alert.module");
const alert_listener_service_1 = require("./alert-listener.service");
const binance_price_api_service_1 = require("../../services/binance-price-api.service");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            event_emitter_1.EventEmitterModule.forRoot(),
            alert_module_1.AlertModule,
        ],
        providers: [
            monitoring_service_1.MonitoringService,
            technical_analysis_service_1.TechnicalAnalysisService,
            price_monitoring_service_1.PriceMonitoringService,
            bollinger_bands_service_1.BollingerBandsService,
            macd_service_1.MACDService,
            rsi_service_1.RSIService,
            ema_service_1.EMAService,
            notification_service_1.NotificationService,
            alert_listener_service_1.AlertListenerService,
            binance_price_api_service_1.BinancePriceApiService
        ],
        exports: [
            monitoring_service_1.MonitoringService,
            technical_analysis_service_1.TechnicalAnalysisService,
            price_monitoring_service_1.PriceMonitoringService,
            notification_service_1.NotificationService,
        ],
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map