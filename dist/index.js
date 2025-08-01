"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
});
// import connectToDb from './models/connection';
const bot_1 = require("./bot/bot");
const axios_1 = __importDefault(require("axios"));
const connection_1 = __importDefault(require("./models/connection"));
function init() {
    (0, connection_1.default)();
    (0, bot_1.initializeBot)();
}
init();
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
