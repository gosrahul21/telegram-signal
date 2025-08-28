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
exports.RSIAnalysisService = void 0;
const delay_1 = require("../bot/utils/delay");
const renderRSISignal_1 = require("../bot/utils/renderRSISignal");
const config_1 = require("../utils/config");
const logger_1 = require("../utils/helper/logger");
const binance_price_api_service_1 = require("./binance-price-api.service");
const techincalIndicators_1 = require("../utils/helper/techincalIndicators");
const getStockHistoricalCandles_1 = require("./getStockHistoricalCandles");
const common_1 = require("@nestjs/common");
let RSIAnalysisService = class RSIAnalysisService {
    constructor(binancePriceApiService, technicalIndicatorsService) {
        this.binancePriceApiService = binancePriceApiService;
        this.technicalIndicatorsService = technicalIndicatorsService;
        this.processRSIAnalysis = async (bot, fallbackKeyPairs, duration, neutral = false) => {
            for (const keyPair of fallbackKeyPairs) {
                try {
                    const candles = config_1.default.UPSTOX_KEY_PAIRS.includes(keyPair)
                        ? await getStockHistoricalCandles_1.upstoxPriceApiService.getStockHistoricalCandles(keyPair, duration)
                        : await this.binancePriceApiService.fetchBinanceCandleData(keyPair, duration);
                    const signals = await this.generateRSISignal(keyPair, candles, neutral);
                    await (0, renderRSISignal_1.renderRSISignal)(keyPair, signals, bot, duration);
                }
                catch (error) {
                    (0, logger_1.logger)(`Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`, 'red');
                }
                finally {
                    await (0, delay_1.delay)(config_1.default.DELAY_BETWEEN_PAIRS_MS);
                }
            }
        };
        this.generateRSISignal = (keyName, candles, neutral = false) => {
            const currentRSI = this.getRSIValue(candles);
            const mostRecentIndex = candles.length - 1;
            const signals = this.rsiSignal(currentRSI, candles[mostRecentIndex].close, candles[mostRecentIndex].closeTime, neutral);
            return signals;
        };
        this.getRSIValue = (candles) => {
            const rsiValues = this.technicalIndicatorsService.calculateRSI(candles.map((candle) => candle.close), 14);
            const currentRSI = rsiValues[rsiValues.length - 1];
            return currentRSI;
        };
        this.rsiSignal = (currentRSI, price, time, neutral = false) => {
            const signals = [];
            if (currentRSI >= config_1.default.RSI_EXTREME_OVERBOUGHT) {
                signals.push({
                    type: `Extreme_Overbought`,
                    time: time,
                    price: price,
                    rsi: currentRSI,
                    details: `RSI is extremely overbought at ${currentRSI.toFixed(2)}, strong sell signal`,
                });
            }
            else if (currentRSI >= config_1.default.RSI_OVERBOUGHT_THRESHOLD) {
                signals.push({
                    type: `Overbought`,
                    time: time,
                    price: price,
                    rsi: currentRSI,
                    details: `RSI is overbought at ${currentRSI.toFixed(2)}, potential sell signal`,
                });
            }
            if (currentRSI <= config_1.default.RSI_EXTREME_OVERSOLD) {
                signals.push({
                    type: `Extreme_Oversold`,
                    time: time,
                    price: price,
                    rsi: currentRSI,
                    details: `RSI is extremely oversold at ${currentRSI.toFixed(2)}, strong buy signal`,
                });
            }
            else if (currentRSI <= config_1.default.RSI_OVERSOLD_THRESHOLD) {
                signals.push({
                    type: `Oversold`,
                    time: time,
                    price: price,
                    rsi: currentRSI,
                    details: `RSI is oversold at ${currentRSI.toFixed(2)}, potential buy signal`,
                });
            }
            else if (neutral) {
                signals.push({
                    type: `Neutral`,
                    time: time,
                    price: price,
                    rsi: currentRSI,
                    details: `RSI is neutral at ${currentRSI.toFixed(2)}`,
                });
            }
            return signals;
        };
    }
};
exports.RSIAnalysisService = RSIAnalysisService;
exports.RSIAnalysisService = RSIAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [binance_price_api_service_1.BinancePriceApiService,
        techincalIndicators_1.TechnicalIndicatorsService])
], RSIAnalysisService);
//# sourceMappingURL=processRSISignal.js.map