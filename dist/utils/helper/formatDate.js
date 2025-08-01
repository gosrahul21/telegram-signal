"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tested-ok
// Function to format date to "yyyy:mm:dd" format
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
exports.default = formatDate;
