"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
// Re-export userRepository to avoid code duplication across services and repositories
exports.userService = userRepository_1.default;
exports.default = userRepository_1.default;
