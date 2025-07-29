"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("../services/userService"));
const userService = new userService_1.default();
exports.checkUserDataMiddleware = async (ctx, next) => {
    const from = ctx.from || "";
    if (!from)
        return;
    const userData = await userService.getUserByChatId(from.id);
    if (userData ? .username !== from.username ||
        userData ? .firstName !== from.first_name ||
        userData ? .lastName !== from.last_name
        :
        :
        :
    ) {
        await userService.updateUser(from.id, from.first_name, from.last_name || "", from.username || "");
    }
    await next();
};
