"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("../bot/bot");
const connection_1 = __importDefault(require("../models/connection"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const axios_1 = __importDefault(require("axios"));
async function init() {
    try {
        // own service call to make backend alive for render
        setInterval(async () => {
            try {
                await axios_1.default.get("https://telegram-signal-suva.onrender.com/");
                // console.log(response.data);
            }
            catch (error) {
                console.log("error on making self request", error);
            }
        }, 1000 * 60 * 10);
        await (0, connection_1.default)();
        await userRepository_1.default.fetchSubscribedUsers();
        (0, bot_1.initializeBot)();
    }
    catch (error) {
        console.log("error on initializing bot", error);
    }
}
exports.default = init;
