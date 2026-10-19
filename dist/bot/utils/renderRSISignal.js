"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRSISignal = exports.renderRSIStatus = void 0;
const userRepository_1 = __importDefault(require("../../repositories/userRepository"));
/**
 * Render RSI status to Telegram subscribers who have enabled RSI and this symbol
 */
const renderRSIStatus = async (pairName, rsiStatus, bot, duration) => {
    // Only broadcast to users who have enabled both RSI alerts and this symbol
    const subscribers = userRepository_1.default.getSubscribedUsersFor(pairName, "RSI");
    const formattedTime = typeof rsiStatus.time === "number"
        ? new Date(rsiStatus.time).toLocaleString()
        : String(rsiStatus.time);
    const message = `
<b>RSI Signal for ${pairName} - ${duration}</b>
📊 <b>Status:</b> ${rsiStatus.type}
💰 <b>Price:</b> ${rsiStatus.price}
📈 <b>RSI:</b> ${rsiStatus.rsi !== undefined ? rsiStatus.rsi.toFixed(2) : "N/A"}
🎯 <b>Signal:</b> ${rsiStatus.signal || rsiStatus.type}
⏰ <b>Time:</b> ${formattedTime}
📝 <b>Details:</b> ${rsiStatus.details}
  `.trim();
    for (const subscribedUser of subscribers) {
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
/**
 * Render RSI signals to Telegram
 */
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
exports.default = exports.renderRSISignal;
