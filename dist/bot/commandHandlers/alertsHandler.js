"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableCommandHandler = exports.enableCommandHandler = exports.alertsCommandHandler = exports.getAlertsMessage = exports.getAlertsKeyboard = void 0;
const grammy_1 = require("grammy");
const config_1 = __importDefault(require("../../config"));
const userRepository_1 = __importStar(require("../../repositories/userRepository"));
/**
 * Constructs the interactive inline keyboard for alert types and symbols
 */
const getAlertsKeyboard = (chatId) => {
    const prefs = userRepository_1.default.getUserPreferences(chatId);
    const kb = new grammy_1.InlineKeyboard();
    // Row 1: Alert Types
    const alertDefinitions = [
        { id: "EMA", label: "EMA Cross" },
        { id: "RSI", label: "RSI" },
        { id: "BB", label: "Bollinger" },
    ];
    for (const { id, label } of alertDefinitions) {
        const isEnabled = prefs.alertTypes.some((t) => t.toUpperCase() === id.toUpperCase());
        kb.text(`${isEnabled ? "✅" : "❌"} ${label}`, `toggle_alert:${id}`);
    }
    kb.row();
    // Symbol Rows (2 per row)
    const symbols = config_1.default.BINANCE_KEY_PAIRS;
    symbols.forEach((symbol, index) => {
        const isEnabled = prefs.subscribedPairs.some((p) => p.toUpperCase() === symbol.toUpperCase());
        kb.text(`${isEnabled ? "✅" : "❌"} ${symbol}`, `toggle_sym:${symbol}`);
        if (index % 2 === 1)
            kb.row();
    });
    if (symbols.length % 2 !== 0)
        kb.row();
    // Bottom action buttons
    kb.text("🔔 Enable All", "alerts:enable_all").text("🔕 Disable All", "alerts:disable_all");
    return kb;
};
exports.getAlertsKeyboard = getAlertsKeyboard;
/**
 * Formats the text summary of active user preferences
 */
const getAlertsMessage = (chatId, username) => {
    const prefs = userRepository_1.default.getUserPreferences(chatId);
    const displayUser = username ? `@${username}` : "Subscriber";
    const alertTypesStr = prefs.alertTypes.length > 0 ? prefs.alertTypes.join(", ") : "None (Muted)";
    const symbolsStr = prefs.subscribedPairs.length > 0
        ? prefs.subscribedPairs.join(", ")
        : "None (Muted)";
    return `
🔔 <b>Alert Settings for ${displayUser}</b>

📊 <b>Active Alert Types:</b>
👉 ${alertTypesStr}

🪙 <b>Active Symbols:</b>
👉 ${symbolsStr}

<i>Tap buttons below to toggle alert types and symbols ON/OFF instantly:</i>
  `.trim();
};
exports.getAlertsMessage = getAlertsMessage;
/**
 * Handler for /alerts and /settings commands
 */
const alertsCommandHandler = async (ctx) => {
    const chatId = ctx.chat.id;
    const username = ctx.from?.username || ctx.from?.first_name || "User";
    // Ensure user is registered in repository
    await userRepository_1.default.addUser({
        chatId,
        telegramId: ctx.from?.id || chatId,
        username,
    });
    const message = (0, exports.getAlertsMessage)(chatId, username);
    const keyboard = (0, exports.getAlertsKeyboard)(chatId);
    await ctx.reply(message, {
        parse_mode: "HTML",
        reply_markup: keyboard,
    });
};
exports.alertsCommandHandler = alertsCommandHandler;
/**
 * Handler for /enable <type|symbol>
 */
const enableCommandHandler = async (ctx) => {
    const chatId = ctx.chat.id;
    const target = ctx.match?.trim().toUpperCase();
    if (!target) {
        return ctx.reply("Please specify an alert type (EMA, RSI, BB) or symbol (e.g. BTCUSDT, SOLUSDT) to enable.\nExample: <code>/enable RSI</code> or <code>/enable BTCUSDT</code> or <code>/enable all</code>", { parse_mode: "HTML" });
    }
    if (target === "ALL") {
        await userRepository_1.default.enableAll(chatId);
        return ctx.reply("✅ All alert types and symbols have been enabled!");
    }
    if (userRepository_1.DEFAULT_ALERT_TYPES.includes(target)) {
        await userRepository_1.default.setAlertType(chatId, target, true);
        return ctx.reply(`✅ <b>${target}</b> alerts have been enabled!`, {
            parse_mode: "HTML",
        });
    }
    // Symbol check
    const availablePairs = config_1.default.BINANCE_KEY_PAIRS.map((p) => p.toUpperCase());
    if (availablePairs.includes(target)) {
        await userRepository_1.default.setSymbol(chatId, target, true);
        return ctx.reply(`✅ Alerts for <b>${target}</b> have been enabled!`, {
            parse_mode: "HTML",
        });
    }
    return ctx.reply(`Unknown option '<b>${target}</b>'. Available alert types: ${userRepository_1.DEFAULT_ALERT_TYPES.join(", ")}. Available symbols: ${config_1.default.BINANCE_KEY_PAIRS.join(", ")}`, { parse_mode: "HTML" });
};
exports.enableCommandHandler = enableCommandHandler;
/**
 * Handler for /disable <type|symbol>
 */
const disableCommandHandler = async (ctx) => {
    const chatId = ctx.chat.id;
    const target = ctx.match?.trim().toUpperCase();
    if (!target) {
        return ctx.reply("Please specify an alert type (EMA, RSI, BB) or symbol (e.g. BTCUSDT, SOLUSDT) to disable.\nExample: <code>/disable RSI</code> or <code>/disable BTCUSDT</code> or <code>/disable all</code>", { parse_mode: "HTML" });
    }
    if (target === "ALL") {
        await userRepository_1.default.disableAll(chatId);
        return ctx.reply("❌ All alert types and symbols have been disabled (muted).");
    }
    if (userRepository_1.DEFAULT_ALERT_TYPES.includes(target)) {
        await userRepository_1.default.setAlertType(chatId, target, false);
        return ctx.reply(`❌ <b>${target}</b> alerts have been disabled!`, {
            parse_mode: "HTML",
        });
    }
    const availablePairs = config_1.default.BINANCE_KEY_PAIRS.map((p) => p.toUpperCase());
    if (availablePairs.includes(target)) {
        await userRepository_1.default.setSymbol(chatId, target, false);
        return ctx.reply(`❌ Alerts for <b>${target}</b> have been disabled!`, {
            parse_mode: "HTML",
        });
    }
    return ctx.reply(`Unknown option '<b>${target}</b>'. Available alert types: ${userRepository_1.DEFAULT_ALERT_TYPES.join(", ")}. Available symbols: ${config_1.default.BINANCE_KEY_PAIRS.join(", ")}`, { parse_mode: "HTML" });
};
exports.disableCommandHandler = disableCommandHandler;
