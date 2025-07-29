"use strict";
exports.__esModule = true;
require("dotenv/config");
// import connectToDb from './models/connection';
var bot_1 = require("./services/bot");
function init() {
    // connectToDb();
    bot_1.initializeBot();
}
init();
