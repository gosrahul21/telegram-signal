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
exports.technicalIndicatorsService = exports.TechnicalIndicatorsService = void 0;
const common_1 = require("@nestjs/common");
const ti = require('technicalindicators');
let TechnicalIndicatorsService = class TechnicalIndicatorsService {
    constructor() { }
    calculateEMA(prices, period) {
        return ti.EMA.calculate({ period, values: prices });
    }
    calculateRSI(prices, period = 14) {
        return ti.RSI.calculate({ period, values: prices });
    }
    calculateMACD(prices) {
        return ti.MACD.calculate({
            values: prices,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });
    }
};
exports.TechnicalIndicatorsService = TechnicalIndicatorsService;
exports.TechnicalIndicatorsService = TechnicalIndicatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TechnicalIndicatorsService);
exports.technicalIndicatorsService = new TechnicalIndicatorsService();
//# sourceMappingURL=techincalIndicators.js.map