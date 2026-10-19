"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEMASignal = void 0;
const userRepository_1 = __importDefault(require("../../repositories/userRepository"));
/**
 * Render EMA crossover signals to subscribed Telegram users
 */
const renderEMASignal = async (pairName, signals, bot, duration) => {
    const signalArray = Array.isArray(signals) ? signals : [signals];
    // Filter subscribers who have both EMA alert type and this symbol enabled
    const subscribers = userRepository_1.default.getSubscribedUsersFor(pairName, "EMA");
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
        for (const { chatId } of subscribers) {
            try {
                await bot.api.sendMessage(chatId, message, { parse_mode: "HTML" });
            }
            catch (error) {
                console.error(`Failed to send EMA signal for ${pairName} to ${chatId}:`, error);
            }
        }
    }
};
exports.renderEMASignal = renderEMASignal;
exports.default = exports.renderEMASignal;
