"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRSISignal = exports.renderRSIStatus = void 0;
const renderRSIStatus = async (pairName, rsiStatus, bot, duration) => {
    const subscribedUsers = [];
    const message = `
<b>RSI Signal for ${pairName} - ${duration}</b>
📊 <b>Status:</b> ${rsiStatus.type}
💰 <b>Price:</b> ${rsiStatus.price}
📈 <b>RSI:</b> ${rsiStatus.rsi.toFixed(2)}
🎯 <b>Signal:</b> ${rsiStatus.signal}
⏰ <b>Time:</b> ${new Date(rsiStatus.time).toLocaleString()}
📝 <b>Details:</b> ${rsiStatus.details}
  `.trim();
    for (const subscribedUser of subscribedUsers) {
        try {
            await bot.api.sendMessage(subscribedUser.chatId, message, {
                parse_mode: "HTML",
            });
        }
        catch (error) {
            console.error(`Failed to send RSI status to ${subscribedUser.chatId}:`, error);
        }
    }
};
exports.renderRSIStatus = renderRSIStatus;
const renderRSISignal = async (pairName, signals, bot, duration) => {
    const signalArray = Array.isArray(signals) ? signals : [signals];
    for (const signal of signalArray) {
        try {
            await (0, exports.renderRSIStatus)(pairName, signal, bot, duration);
        }
        catch (error) {
            console.error(`Failed to send RSI signal to ${pairName}:`, error);
        }
    }
};
exports.renderRSISignal = renderRSISignal;
//# sourceMappingURL=renderRSISignal.js.map