"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const getSignature = (body, secret) => {
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto_1.default
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
    return signature;
};
exports.default = getSignature;
