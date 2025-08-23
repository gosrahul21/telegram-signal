"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStatusByDuration = void 0;
const config_1 = require("../../config");
const Duration_1 = require("../../types/Duration");
const delay_1 = require("../utils/delay");
const processRSISignal_1 = require("../../services/processRSISignal");
const handleStatusByDuration = async (ctx, duration) => {
    try {
        const keyName = ctx.match;
        const pairName = keyName;
        if (!pairName) {
            ctx.reply(`Please provide a valid pair name or you will get the status of the following pairs: ` +
                config_1.default.BINANCE_KEY_PAIRS.join(', '));
            await (0, processRSISignal_1.default)(ctx, config_1.default.BINANCE_KEY_PAIRS, duration, true);
            await (0, delay_1.delay)(1000);
            await (0, processRSISignal_1.default)(ctx, config_1.default.UPSTOX_KEY_PAIRS, duration === '1h'
                ? Duration_1.UpstoxInterval.OneHour
                : duration === '4h'
                    ? Duration_1.UpstoxInterval.FourHours
                    : Duration_1.UpstoxInterval.OneDay, true);
            return;
        }
        await (0, processRSISignal_1.default)(ctx, [keyName], duration);
    }
    catch (error) {
        ctx.reply(`Error getting status for ${ctx.match}:`, error);
    }
};
exports.handleStatusByDuration = handleStatusByDuration;
//# sourceMappingURL=handleStatusByDuration.js.map