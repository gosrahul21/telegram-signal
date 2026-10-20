"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEMASignal = void 0;
const logger_1 = require("../../logger");
const userRepository_1 = __importDefault(require("../../repositories/userRepository"));
/**
 * Render EMA crossover signals to subscribed Telegram users.
 * Returns the count of successfully sent Telegram notifications.
 */
const renderEMASignal = async (pairName, signals, bot, duration) => {
    // If in-memory subscriber cache is empty, refresh from DB first
    if (userRepository_1.default.getSubscribedUsers().length === 0) {
        await userRepository_1.default.fetchSubscribedUsers();
    }
    const signalArray = Array.isArray(signals) ? signals : [signals];
    // Filter subscribers who have both EMA alert type and this symbol enabled
    const subscribers = userRepository_1.default.getSubscribedUsersFor(pairName, "EMA");
    let sentCount = 0;
    for (const signal of signalArray) {
        const formattedTime = typeof signal.time === "number"
            ? new Date(signal.time).toLocaleString()
            : String(signal.time);
        const message = `
<b>EMA Signal for ${pairName} - ${duration}</b>
🎯 <b>Type:</b> ${signal.type}
💰 <b>Price:</b> ${signal.price}
⏰ <b>Time:</b> ${formattedTime}
📝 <b>Details:</b> ${signal.details}
    `.trim();
        if (subscribers.length === 0) {
            (0, logger_1.logger)(`[EMA Alert] Signal ${signal.type} detected for ${pairName} [${duration}] but 0 subscribers were eligible. (Total subscribers in memory: ${userRepository_1.default.getSubscribedUsers().length})`, "yellow");
        }
        for (const { chatId } of subscribers) {
            try {
                await bot.api.sendMessage(chatId, message, { parse_mode: "HTML" });
                sentCount++;
                (0, logger_1.logger)(`[EMA Alert Sent] Successfully delivered ${signal.type} for ${pairName} [${duration}] to chat ${chatId}`, "green");
            }
            catch (error) {
                console.error(`Failed to send EMA signal for ${pairName} to ${chatId}:`, error);
            }
        }
    }
    return sentCount;
};
exports.renderEMASignal = renderEMASignal;
exports.default = exports.renderEMASignal;
