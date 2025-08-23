"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilsModule = void 0;
const common_1 = require("@nestjs/common");
const delay_service_1 = require("./delay.service");
const generate_rsi_over_bought_signal_service_1 = require("./generate-rsi-over-bought-signal.service");
const generate_rsi_over_sold_signal_service_1 = require("./generate-rsi-over-sold-signal.service");
const render_rsi_signal_service_1 = require("./render-rsi-signal.service");
const render_signals_service_1 = require("./render-signals.service");
const rsi_signal_service_1 = require("./rsi-signal.service");
let UtilsModule = class UtilsModule {
};
exports.UtilsModule = UtilsModule;
exports.UtilsModule = UtilsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            delay_service_1.DelayService,
            generate_rsi_over_bought_signal_service_1.GenerateRSIOverBoughtSignalService,
            generate_rsi_over_sold_signal_service_1.GenerateRSIOverSoldSignalService,
            render_rsi_signal_service_1.RenderRSISignalService,
            render_signals_service_1.RenderSignalsService,
            rsi_signal_service_1.RsiSignalService,
        ],
        exports: [
            delay_service_1.DelayService,
            generate_rsi_over_bought_signal_service_1.GenerateRSIOverBoughtSignalService,
            generate_rsi_over_sold_signal_service_1.GenerateRSIOverSoldSignalService,
            render_rsi_signal_service_1.RenderRSISignalService,
            render_signals_service_1.RenderSignalsService,
            rsi_signal_service_1.RsiSignalService,
        ],
    })
], UtilsModule);
//# sourceMappingURL=utils.module.js.map