"use strict";
exports.__esModule = true;
var dotenv_1 = require("dotenv");
var env = dotenv_1.config();
exports["default"] = env.parsed;
