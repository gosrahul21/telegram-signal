"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSignal = void 0;
const renderSignal = async (pairName, signals, ctx, duration) => {
    await ctx.reply(`<b>Signal for ${pairName} - ${duration} </b>\nType: ${signals.type}\nTime: ${signals.time}\nPrice: ${signals.price}\nDetails: ${signals.details}`, { parse_mode: "HTML" });
};
exports.renderSignal = renderSignal;
//# sourceMappingURL=renderSignals.js.map