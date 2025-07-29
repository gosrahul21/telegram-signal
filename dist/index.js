"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
// import connectToDb from './models/connection';
const bot_1 = require("./services/bot");
function init() {
    // connectToDb();
    bot_1.initializeBot();
}
init();
