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
exports.BinancePriceApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let BinancePriceApiService = class BinancePriceApiService {
    constructor() { }
    async fetchBinanceCandleData(symbol, interval) {
        try {
            const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`;
            const response = await axios_1.default.get(url);
            return response.data.map((candle) => ({
                openTime: candle[0],
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5]),
                closeTime: candle[6],
            }));
        }
        catch (error) {
            console.error('Error fetching Binance candle data:', error);
            return null;
        }
    }
    async fetchBinanceTickerPrice(symbol) {
        try {
            const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching Binance ticker price:', error);
            return null;
        }
    }
};
exports.BinancePriceApiService = BinancePriceApiService;
exports.BinancePriceApiService = BinancePriceApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BinancePriceApiService);
//# sourceMappingURL=binance-price-api.service.js.map