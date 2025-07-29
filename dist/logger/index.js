"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = (message, color = "red") => {
    const colorCode = {
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        white: 37
    }[color];
    console.log(`\x1b[${colorCode}m%s\x1b[0m`, message);
};
