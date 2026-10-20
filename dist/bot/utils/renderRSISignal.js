"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRSISignal = exports.renderRSIStatus = void 0;
const userRepository_1 = __importDefault(require("../../repositories/userRepository"));
const logger_1 = require("../../logger");
/**
 * Render RSI status to Telegram subscribers who have enabled RSI and this symbol
 */
const renderRSIStatus = async (pairName, rsiStatus, bot, duration) => {
    // If in-memory subscriber cache is empty, refresh from DB first
    if (userRepository_1.default.getSubscribedUsers().length === 0) {
        await userRepository_1.default.fetchSubscribedUsers();
    }
    // Only broadcast to users who have enabled both RSI alerts and this symbol
    const subscribers = userRepository_1.default.getSubscribedUsersFor(pairName, "RSI");
    let sentCount = 0;
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
    if (subscribers.length === 0) {
        (0, logger_1.logger)(`[RSI Alert] Signal ${rsiStatus.type} detected for ${pairName} [${duration}] but 0 subscribers were eligible. (Total subscribers in memory: ${userRepository_1.default.getSubscribedUsers().length})`, "yellow");
    }
    for (const subscribedUser of subscribers) {
        try {
            await bot.api.sendMessage(subscribedUser.chatId, message, {
                parse_mode: "HTML",
            });
            sentCount++;
            (0, logger_1.logger)(`[RSI Alert Sent] Successfully delivered ${rsiStatus.type} for ${pairName} [${duration}] to chat ${subscribedUser.chatId}`, "green");
        }
        catch (error) {
            console.error(`Failed to send RSI status to ${subscribedUser.chatId}:`, error);
        }
    }
    return sentCount;
};
exports.renderRSIStatus = renderRSIStatus;
/**
 * Render RSI signals to Telegram
 */
const renderRSISignal = async (pairName, signals, bot, duration) => {
    const signalArray = Array.isArray(signals) ? signals : [signals];
    let totalSent = 0;
    for (const signal of signalArray) {
        try {
            const sent = await (0, exports.renderRSIStatus)(pairName, signal, bot, duration);
            totalSent += sent;
        }
        catch (error) {
            console.error(`Failed to send RSI signal to ${pairName}:`, error);
        }
    }
    return totalSent;
};
exports.renderRSISignal = renderRSISignal;
exports.default = exports.renderRSISignal;
