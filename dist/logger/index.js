"use strict";
exports.__esModule = true;
exports.logger = function (message, color) {
    if (color === void 0) { color = "red"; }
    var colorCode = {
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        white: 37
    }[color];
    console.log("\u001B[" + colorCode + "m%s\u001B[0m", message);
};
