"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hourStatus = void 0;
const handleStatusByDuration_1 = require("./handleStatusByDuration");
const hourStatus = async (ctx) => {
    await (0, handleStatusByDuration_1.handleStatusByDuration)(ctx, "1h", undefined);
};
exports.hourStatus = hourStatus;
