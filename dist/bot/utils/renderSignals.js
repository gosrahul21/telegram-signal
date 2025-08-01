"use strict";
// import userService from "./userService";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSignal = void 0;
const renderSignal = async (pairName, signals, ctx, duration) => {
    // retrieve subscribed users
    await ctx.reply(`<b>Signal for ${pairName} - ${duration} </b>\nType: ${signals.type}\nTime: ${signals.time}\nPrice: ${signals.price}\nDetails: ${signals.details}`, { parse_mode: "HTML" });
};
exports.renderSignal = renderSignal;
