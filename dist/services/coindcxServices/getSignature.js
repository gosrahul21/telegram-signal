"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const getSignature = (body, secret) => {
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto_1.default
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
    return signature;
};
exports.default = getSignature;
//# sourceMappingURL=getSignature.js.map