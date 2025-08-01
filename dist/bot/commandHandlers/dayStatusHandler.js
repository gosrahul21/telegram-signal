"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dayStatus = void 0;
const handleStatusByDuration_1 = require("./handleStatusByDuration");
const dayStatus = async (ctx) => {
    await (0, handleStatusByDuration_1.handleStatusByDuration)(ctx, "1d", undefined);
};
exports.dayStatus = dayStatus;
