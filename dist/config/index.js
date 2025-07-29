"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const env = dotenv_1.config();
exports.default = env.parsed;
