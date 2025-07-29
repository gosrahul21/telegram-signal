"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var crypto_1 = __importDefault(require("crypto"));
var getSignature = function (body, secret) {
    var payload = Buffer.from(JSON.stringify(body)).toString();
    var signature = crypto_1["default"]
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
    return signature;
};
exports["default"] = getSignature;
