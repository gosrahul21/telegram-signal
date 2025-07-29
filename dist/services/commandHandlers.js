"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const signals_1 = require("./signals");
const emaCrossScheduler_1 = require("../scheduler/emaCrossScheduler");
const rsiScheduler_1 = require("../scheduler/rsiScheduler");
// import userService from "./userService";
const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "BNBUSDT", "ETHUSDT"];
const markets = ["BTCUSDT", "SOLUSDT", "BNBUSDT", "ETHUSDT"];
exports.renderSignal = async (pairName, signals, ctx, duration) => {
    // retrieve subscribed users
    await ctx.reply(`<b>Signal for ${pairName} - ${duration} </b>\nType: ${signals.type}\nTime: ${signals.time}\nPrice: ${signals.price}\nDetails: ${signals.details}`, { parse_mode: "HTML" });
};
// subcribe to the notification
exports.onSubscribe = async (ctx) => {
    const telegramId = ctx.from.id;
    const chatId = ctx.chat.id;
    // Create a user object
    const user = {
        telegramId,
        username: ctx.from.username || ctx.from.first_name + " " + ctx.from.last_name,
        chatId,
    };
    // Add the user to the database using userService
    try {
        // await userService.addUser(user);
        ctx.reply(`Subscribed successfully`);
    }
    catch (error) {
        ctx.reply(`Error adding user ${telegramId} to the database:`, error);
    }
};
exports.hourStatus = async (ctx) => {
    const keyName = ctx.match;
    const pariName = constants_1.keyPairsMapping[keyName];
    const duration = "1h";
    if (!pariName) {
        return fallbackKeyPairs.forEach((fallbackPair) => {
            exports.getStatus(ctx, fallbackPair, "1h");
        });
    }
    await exports.getStatus(ctx, keyName, duration);
};
exports.fourHourStatus = async (ctx) => {
    const keyName = ctx.match;
    const pairName = constants_1.keyPairsMapping[keyName];
    // If pairName is not found in keyPairsMapping, use fallback key pairs
    if (!pairName) {
        fallbackKeyPairs.forEach((fallbackPair) => {
            exports.getStatus(ctx, fallbackPair, "4h");
        });
        return;
    }
    // If pairName is found, proceed with getting the status
    await exports.getStatus(ctx, keyName, "4h");
};
// Function to get the daily status
exports.dayStatus = async (ctx) => {
    const keyName = ctx.match;
    const pairName = constants_1.keyPairsMapping[keyName];
    // If pairName is not found in keyPairsMapping, use fallback key pairs
    if (!pairName) {
        fallbackKeyPairs.forEach((fallbackPair) => {
            exports.getStatus(ctx, fallbackPair, "1d");
        });
        return;
    }
    // If pairName is found, proceed with getting the status
    await exports.getStatus(ctx, keyName, "1d");
};
exports.getStatus = async (ctx, keyName, duration) => {
    const pariName = constants_1.keyPairsMapping[keyName];
    const signal = await signals_1.getTrendStatus(pariName, duration);
    exports.renderSignal(pariName, signal, ctx, duration);
};
// EMA Cross Scheduler - moved to emaCrossScheduler.ts
exports.cryptoScheduler = async (bot) => {
    await emaCrossScheduler_1.emaCrossScheduler(bot);
};
// RSI Scheduler - moved to rsiScheduler.ts
exports.rsiOverboughtScheduler = async (bot) => {
    await rsiScheduler_1.rsiScheduler(bot);
};
exports.generateInOutSignal = async () => { };
