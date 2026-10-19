"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserDataMiddleware = void 0;
const userService_1 = __importDefault(require("../services/userService"));
const checkUserDataMiddleware = async (ctx, next) => {
    const from = ctx.from;
    if (!from)
        return;
    const userData = await userService_1.default.getUserByChatId(from.id);
    if (userData && userData.username !== from.username) {
        await userService_1.default.updateUser(String(userData._id || from.id), {
            username: from.username || "",
        });
    }
    await next();
};
exports.checkUserDataMiddleware = checkUserDataMiddleware;
