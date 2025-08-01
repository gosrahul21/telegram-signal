"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
const delay = async (timeoutMs) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, timeoutMs);
    });
};
exports.delay = delay;
