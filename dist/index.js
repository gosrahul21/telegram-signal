"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = require("express");
const bot_1 = require("./bot/bot");
const axios_1 = require("axios");
const connection_1 = require("./models/connection");
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
});
function init() {
    (0, connection_1.default)();
    (0, bot_1.initializeBot)();
}
init();
setInterval(async () => {
    try {
        await axios_1.default.get("https://telegram-signal-suva.onrender.com/");
    }
    catch (error) {
        console.log("error on making self request", error);
    }
}, 1000 * 60 * 10);
//# sourceMappingURL=index.js.map