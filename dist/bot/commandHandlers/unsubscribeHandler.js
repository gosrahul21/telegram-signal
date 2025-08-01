"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unSubscribe = void 0;
const userRepository_1 = __importDefault(require("../../repositories/userRepository"));
// subcribe to the notification
const unSubscribe = async (ctx) => {
    const telegramId = ctx.from.id;
    const chatId = ctx.chat.id;
    // Create a user object
    // Add the user to the database using userService
    try {
        const newUser = await userRepository_1.default.deleteUser(chatId);
        if (newUser)
            ctx.reply(`Unsubscribed successfully`);
        else
            ctx.reply("user not found");
    }
    catch (error) {
        ctx.reply(`Error adding user ${telegramId} to the database:`, error);
    }
};
exports.unSubscribe = unSubscribe;
