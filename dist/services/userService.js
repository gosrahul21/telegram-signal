"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var user_1 = require("../models/user");
// Define the UserService class
var UserService = /** @class */ (function () {
    function UserService() {
        this.subscribedUsers = [];
        this.fetchSubscribedUsers();
    }
    // Method to add a new user
    UserService.prototype.addUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var newUser, savedUser, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Create a new user instance
                        if (this.subscribedUsers.find(function (_a) {
                            var chatId = _a.chatId;
                            return chatId === userData.chatId;
                        }))
                            return [2 /*return*/];
                        newUser = new user_1.User(userData);
                        return [4 /*yield*/, newUser.save()];
                    case 1:
                        savedUser = _a.sent();
                        this.subscribedUsers.push(savedUser.toObject());
                        // Return the saved user
                        return [2 /*return*/, savedUser.toObject()];
                    case 2:
                        error_1 = _a.sent();
                        // Handle any errors
                        console.error("Error adding user:", error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.getSubscribedUsers = function () {
        try {
            return this.subscribedUsers;
        }
        catch (error) {
            console.error("Get subscribed users:", error);
            throw error;
        }
    };
    UserService.prototype.fetchSubscribedUserFromDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_1.User.find({}).lean()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Get subscribed users:", error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Method to delete a user by their ID
    UserService.prototype.deleteUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var deletedUser, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_1.User.findByIdAndDelete(userId).lean().lean()];
                    case 1:
                        deletedUser = _a.sent();
                        // Return the deleted user
                        return [2 /*return*/, deletedUser];
                    case 2:
                        error_3 = _a.sent();
                        // Handle any errors
                        console.error("Error deleting user:", error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Method to update a user's information
    UserService.prototype.updateUser = function (userId, updateData) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedUser, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_1.User.findByIdAndUpdate(userId, updateData, {
                                "new": true
                            }).lean()];
                    case 1:
                        updatedUser = _a.sent();
                        // Return the updated user
                        return [2 /*return*/, updatedUser];
                    case 2:
                        error_4 = _a.sent();
                        // Handle any errors
                        console.error("Error updating user:", error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Method to retrieve a user by their ID
    UserService.prototype.getUserById = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_1.User.findById(userId).lean()];
                    case 1:
                        user = _a.sent();
                        // Return the user
                        return [2 /*return*/, user];
                    case 2:
                        error_5 = _a.sent();
                        // Handle any errors
                        console.error("Error retrieving user:", error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Method to retrieve a user by chatId
    UserService.prototype.getUserByChatId = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_1.User.findOne({ chatId: chatId }).lean()];
                    case 1:
                        user = _a.sent();
                        // Return the user
                        return [2 /*return*/, user];
                    case 2:
                        error_6 = _a.sent();
                        // Handle any errors
                        console.error("Error retrieving user:", error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.fetchSubscribedUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchSubscribedUserFromDb()];
                    case 1:
                        users = _a.sent();
                        users.map(function (user) { return _this.subscribedUsers.push(user); });
                        return [2 /*return*/];
                }
            });
        });
    };
    return UserService;
}());
// Export the UserService class
exports["default"] = new UserService();
