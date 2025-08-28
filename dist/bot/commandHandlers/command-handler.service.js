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
exports.CommandHandlerService = void 0;
const config_1 = require("../../utils/config");
const processRSISignal_1 = require("../../services/processRSISignal");
const common_1 = require("@nestjs/common");
const delay_1 = require("../utils/delay");
const Duration_1 = require("../../utils/types/Duration");
let CommandHandlerService = class CommandHandlerService {
    constructor(rsiAnalysisService) {
        this.rsiAnalysisService = rsiAnalysisService;
        this.handleStatusByDuration = async (ctx, duration) => {
            try {
                const keyName = ctx.match;
                const pairName = keyName;
                if (!pairName) {
                    ctx.reply(`Please provide a valid pair name or you will get the status of the following pairs: ` +
                        config_1.default.BINANCE_KEY_PAIRS.join(', '));
                    await this.rsiAnalysisService.processRSIAnalysis(ctx, config_1.default.BINANCE_KEY_PAIRS, duration, true);
                    await (0, delay_1.delay)(1000);
                    await this.rsiAnalysisService.processRSIAnalysis(ctx, config_1.default.UPSTOX_KEY_PAIRS, duration === '1h'
                        ? Duration_1.UpstoxInterval.OneHour
                        : duration === '4h'
                            ? Duration_1.UpstoxInterval.FourHours
                            : Duration_1.UpstoxInterval.OneDay, true);
                    return;
                }
                await this.rsiAnalysisService.processRSIAnalysis(ctx, [keyName], duration);
            }
            catch (error) {
                ctx.reply(`Error getting status for ${ctx.match}:`, error);
            }
        };
    }
    async getStatusByDurationHandler(ctx, duration) {
        await this.handleStatusByDuration(ctx, duration);
    }
};
exports.CommandHandlerService = CommandHandlerService;
exports.CommandHandlerService = CommandHandlerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [processRSISignal_1.RSIAnalysisService])
], CommandHandlerService);
//# sourceMappingURL=command-handler.service.js.map