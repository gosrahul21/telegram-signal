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
const monitoring_service_1 = require("./services/monitoring.service");
const technical_analysis_service_1 = require("./technical-analysis.service");
const price_monitoring_service_1 = require("./price-monitoring.service");
const alert_module_1 = require("../alert/alert.module");
const alert_listener_service_1 = require("./alert-listener.service");
const binance_price_api_service_1 = require("../../services/binance-price-api.service");
const monitoring_entity_1 = require("./entity/monitoring.entity");
const mongoose_1 = require("@nestjs/mongoose");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            alert_module_1.AlertModule,
            mongoose_1.MongooseModule.forFeature([
                { name: monitoring_entity_1.Monitoring.name, schema: monitoring_entity_1.MonitoringSchema },
            ]),
        ],
        providers: [
            monitoring_service_1.MonitoringService,
            technical_analysis_service_1.TechnicalAnalysisService,
            price_monitoring_service_1.PriceMonitoringService,
            alert_listener_service_1.AlertListenerService,
            binance_price_api_service_1.BinancePriceApiService,
        ],
        exports: [
            monitoring_service_1.MonitoringService,
            technical_analysis_service_1.TechnicalAnalysisService,
            price_monitoring_service_1.PriceMonitoringService,
        ],
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map