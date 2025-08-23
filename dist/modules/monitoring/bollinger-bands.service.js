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
var BollingerBandsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BollingerBandsService = void 0;
const common_1 = require("@nestjs/common");
const technical_analysis_service_1 = require("./technical-analysis.service");
let BollingerBandsService = BollingerBandsService_1 = class BollingerBandsService {
    constructor(technicalAnalysisService) {
        this.technicalAnalysisService = technicalAnalysisService;
        this.logger = new common_1.Logger(BollingerBandsService_1.name);
    }
    async checkBollingerBandsConditions(symbol, timeframe, conditions) {
        try {
            const bbData = await this.technicalAnalysisService.getBollingerBands(symbol, timeframe, conditions.period || 20, conditions.stdDev || 2);
            const currentPrice = bbData.middleBand;
            const { upperBand, lowerBand, middleBand } = bbData;
            let triggered = false;
            let message = '';
            if (conditions.breakout === 'upper' && currentPrice > upperBand) {
                triggered = true;
                message = `Upper Bollinger Band breakout detected for ${symbol}`;
            }
            else if (conditions.breakout === 'lower' && currentPrice < lowerBand) {
                triggered = true;
                message = `Lower Bollinger Band breakout detected for ${symbol}`;
            }
            if (conditions.bounce === 'upper' && currentPrice <= upperBand && currentPrice > middleBand) {
                triggered = true;
                message = `Upper Bollinger Band bounce detected for ${symbol}`;
            }
            else if (conditions.bounce === 'lower' && currentPrice >= lowerBand && currentPrice < middleBand) {
                triggered = true;
                message = `Lower Bollinger Band bounce detected for ${symbol}`;
            }
            if (conditions.squeeze && this.isBollingerBandsSqueeze(bbData)) {
                triggered = true;
                message = `Bollinger Bands squeeze detected for ${symbol}`;
            }
            if (conditions.expansion && this.isBollingerBandsExpansion(bbData)) {
                triggered = true;
                message = `Bollinger Bands expansion detected for ${symbol}`;
            }
            return {
                triggered,
                data: bbData,
                message,
            };
        }
        catch (error) {
            this.logger.error(`Error checking Bollinger Bands conditions for ${symbol}:`, error);
            throw error;
        }
    }
    isBollingerBandsSqueeze(bbData) {
        const { upperBand, lowerBand, middleBand } = bbData;
        const bandwidth = (upperBand - lowerBand) / middleBand;
        return bandwidth < 0.1;
    }
    isBollingerBandsExpansion(bbData) {
        const { upperBand, lowerBand, middleBand } = bbData;
        const bandwidth = (upperBand - lowerBand) / middleBand;
        return bandwidth > 0.3;
    }
    async getBollingerBandsAnalysis(symbol, timeframe) {
        try {
            const bbData = await this.technicalAnalysisService.getBollingerBands(symbol, timeframe);
            const { upperBand, lowerBand, middleBand, standardDeviation } = bbData;
            let analysis = '';
            let recommendation = '';
            let risk = 'medium';
            const bandwidth = (upperBand - lowerBand) / middleBand;
            const position = (middleBand - lowerBand) / (upperBand - lowerBand);
            if (bandwidth < 0.1) {
                analysis = 'Bollinger Bands are in a squeeze, indicating low volatility and potential breakout ahead.';
                recommendation = 'Prepare for potential breakout. Consider setting alerts for price movement beyond bands.';
                risk = 'medium';
            }
            else if (bandwidth > 0.3) {
                analysis = 'Bollinger Bands are expanded, indicating high volatility and potential reversal.';
                recommendation = 'Be cautious of potential reversal. Consider taking profits or setting tighter stops.';
                risk = 'high';
            }
            else {
                analysis = 'Bollinger Bands are in normal range, indicating moderate volatility.';
                recommendation = 'Monitor for standard breakout or bounce opportunities.';
                risk = 'low';
            }
            if (position > 0.8) {
                analysis += ' Price is near upper band, suggesting potential resistance.';
                recommendation += ' Consider selling or setting short positions.';
                risk = 'high';
            }
            else if (position < 0.2) {
                analysis += ' Price is near lower band, suggesting potential support.';
                recommendation += ' Consider buying or setting long positions.';
                risk = 'low';
            }
            return {
                analysis,
                recommendation,
                risk,
                data: bbData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting Bollinger Bands analysis for ${symbol}:`, error);
            throw error;
        }
    }
};
exports.BollingerBandsService = BollingerBandsService;
exports.BollingerBandsService = BollingerBandsService = BollingerBandsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_analysis_service_1.TechnicalAnalysisService])
], BollingerBandsService);
//# sourceMappingURL=bollinger-bands.service.js.map