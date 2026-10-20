"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBBSignal = void 0;
const logger_1 = require("../../logger");
const userRepository_1 = __importDefault(require("../../repositories/userRepository"));
/**
 * Render Bollinger Bands signal to Telegram subscribers.
 * Returns the count of successfully sent Telegram notifications.
 */
const renderBBSignal = async (pairName, signals, bot, duration) => {
    // If in-memory subscriber cache is empty, refresh from DB first
    if (userRepository_1.default.getSubscribedUsers().length === 0) {
        await userRepository_1.default.fetchSubscribedUsers();
    }
    const subscribedUsers = userRepository_1.default.getSubscribedUsersFor(pairName, "BB");
    const signalArray = Array.isArray(signals) ? signals : [signals];
    let sentCount = 0;
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
        if (subscribedUsers.length === 0) {
            (0, logger_1.logger)(`[BB Alert] Detected ${signal.type} for ${pairName} [${duration}] but 0 subscribers were eligible. (Total subscribers in memory: ${userRepository_1.default.getSubscribedUsers().length})`, "yellow");
        }
        for (const subscribedUser of subscribedUsers) {
            try {
                await bot.api.sendMessage(subscribedUser.chatId, message, {
                    parse_mode: "HTML",
                });
                sentCount++;
                (0, logger_1.logger)(`[BB Alert Sent] Successfully delivered ${signal.type} for ${pairName} [${duration}] to chat ${subscribedUser.chatId}`, "green");
            }
            catch (error) {
                console.error(`Failed to send BB signal for ${pairName} to ${subscribedUser.chatId}:`, error);
            }
        }
    }
    return sentCount;
};
exports.renderBBSignal = renderBBSignal;
exports.default = exports.renderBBSignal;
