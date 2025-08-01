"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSubscribe = void 0;
const userRepository_1 = __importDefault(require("../../repositories/userRepository"));
// subcribe to the notification
const onSubscribe = async (ctx) => {
    const telegramId = ctx.from.id;
    const chatId = ctx.chat.id;
    // Create a user object
    const user = {
        telegramId, // The user's Telegram ID
        username: ctx.from.username || ctx.from.first_name + " " + ctx.from.last_name,
        chatId, // The user's chat ID
        // subscriptions: pairName ? [pairName] : fallbackKeyPairs // List of subscriptions (individual or fallback pairs)
    };
    // Add the user to the database using userService
    try {
        const newUser = await userRepository_1.default.addUser(user);
        ctx.reply(`Subscribed successfully with ${userRepository_1.default.getSubscribedUsers().length} users`);
    }
    catch (error) {
        ctx.reply(`Error adding user ${telegramId} to the database:`, error);
    }
};
exports.onSubscribe = onSubscribe;
