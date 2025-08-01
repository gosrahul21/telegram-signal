"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fourHourStatus = void 0;
const handleStatusByDuration_1 = require("./handleStatusByDuration");
const fourHourStatus = async (ctx) => {
    await (0, handleStatusByDuration_1.handleStatusByDuration)(ctx, "4h", undefined);
};
exports.fourHourStatus = fourHourStatus;
