"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBBSignal = void 0;
const userRepository_1 = __importDefault(require("../../repositories/userRepository"));
/**
 * Render Bollinger Bands signal to Telegram subscribers
 */
const renderBBSignal = async (pairName, signals, bot, duration) => {
    const subscribedUsers = userRepository_1.default.getSubscribedUsersFor(pairName, "BB");
    const signalArray = Array.isArray(signals) ? signals : [signals];
    for (const signal of signalArray) {
        const isUpper = signal.type === "bb_upper";
        const signalLabel = isUpper
            ? "🔴 BB Upper Hit (Overbought / Resistance)"
            : "🟢 BB Lower Hit (Oversold / Support)";
        const formattedTime = typeof signal.candleTime === "number"
            ? new Date(signal.candleTime).toLocaleString()
            : String(signal.candleTime);
        const message = `
<b>Bollinger Bands Alert: ${pairName} [${duration}]</b>
🎯 <b>Signal:</b> ${signalLabel}
💰 <b>Price:</b> ${signal.price}
📈 <b>Upper Band:</b> ${signal.upper.toFixed(2)}
⚖️ <b>Middle (20 SMA):</b> ${signal.middle.toFixed(2)}
📉 <b>Lower Band:</b> ${signal.lower.toFixed(2)}
⏰ <b>Time:</b> ${formattedTime}
📝 <b>Details:</b> ${signal.details}
    `.trim();
        for (const subscribedUser of subscribedUsers) {
            try {
                await bot.api.sendMessage(subscribedUser.chatId, message, {
                    parse_mode: "HTML",
                });
            }
            catch (error) {
                console.error(`Failed to send BB signal for ${pairName} to ${subscribedUser.chatId}:`, error);
            }
        }
    }
};
exports.renderBBSignal = renderBBSignal;
exports.default = exports.renderBBSignal;
