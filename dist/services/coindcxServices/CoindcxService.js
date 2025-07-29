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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var dotenv_1 = __importDefault(require("dotenv"));
var getSignature_1 = __importDefault(require("./getSignature"));
dotenv_1["default"].config();
var CoindcxService = /** @class */ (function () {
    function CoindcxService() {
        this.baseurl = "https://api.coindcx.com";
        this.apiKey = process.env.COINDCX_API_KEY || "";
        this.secretKey = process.env.COINDCX_SECRET_KEY || "";
        if (!this.apiKey || !this.secretKey) {
            throw new Error("API credentials not found in environment variables");
        }
    }
    CoindcxService.prototype.getTimestamp = function () {
        return Math.floor(Date.now());
    };
    CoindcxService.prototype.getHeaders = function (body) {
        var signature = getSignature_1["default"](body, this.secretKey);
        return {
            "X-AUTH-APIKEY": this.apiKey,
            "X-AUTH-SIGNATURE": signature
        };
    };
    CoindcxService.prototype.getPositions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = {
                            timestamp: this.getTimestamp(),
                            page: "1",
                            size: "10",
                            margin_currency_short_name: ["USDT", "INR"]
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].post(this.baseurl + "/exchange/v1/derivatives/futures/positions", body, {
                                headers: this.getHeaders(body)
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_1 = _a.sent();
                        if (axios_1["default"].isAxiosError(error_1)) {
                            throw new Error("API request failed: " + error_1.message);
                        }
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoindcxService.prototype.createFuturesOrder = function (_a) {
        var side = _a.side, pair = _a.pair, order_type = _a.order_type, price = _a.price, stop_price = _a.stop_price, total_quantity = _a.total_quantity, leverage = _a.leverage, _b = _a.notification, notification = _b === void 0 ? "no_notification" : _b, _c = _a.time_in_force, time_in_force = _c === void 0 ? "good_till_cancel" : _c, _d = _a.margin_currency_short_name, margin_currency_short_name = _d === void 0 ? "USDT" : _d, position_margin_type = _a.position_margin_type, take_profit_price = _a.take_profit_price, stop_loss_price = _a.stop_loss_price;
        return __awaiter(this, void 0, void 0, function () {
            var body, response, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        body = {
                            timestamp: this.getTimestamp(),
                            order: {
                                side: side,
                                pair: pair,
                                order_type: order_type,
                                price: price,
                                stop_price: stop_price,
                                total_quantity: total_quantity,
                                leverage: leverage,
                                notification: notification,
                                time_in_force: time_in_force,
                                margin_currency_short_name: margin_currency_short_name,
                                position_margin_type: position_margin_type,
                                take_profit_price: take_profit_price,
                                stop_loss_price: stop_loss_price
                            }
                        };
                        console.log(body);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].post(this.baseurl + "/exchange/v1/derivatives/futures/orders/create", body, {
                                headers: this.getHeaders(body)
                            })];
                    case 2:
                        response = _e.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_2 = _e.sent();
                        if (axios_1["default"].isAxiosError(error_2)) {
                            // console.log(error.response && error.response);
                            throw new Error("Failed to create futures order: " + error_2.message);
                        }
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoindcxService.prototype.cancelOrder = function (_a) {
        var orderId = _a.orderId;
        return __awaiter(this, void 0, void 0, function () {
            var body, response, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        body = {
                            timestamp: this.getTimestamp(),
                            id: orderId
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].post(this.baseurl + "/exchange/v1/derivatives/futures/orders/cancel", body, {
                                headers: this.getHeaders(body)
                            })];
                    case 2:
                        response = _b.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_3 = _b.sent();
                        if (axios_1["default"].isAxiosError(error_3)) {
                            throw new Error("Failed to cancel order: " + error_3.message);
                        }
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoindcxService.prototype.getWalletDetails = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = {
                            timestamp: this.getTimestamp()
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].get(this.baseurl + "/exchange/v1/derivatives/futures/wallets", {
                                headers: this.getHeaders(body),
                                params: body
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_4 = _a.sent();
                        if (axios_1["default"].isAxiosError(error_4)) {
                            throw new Error("Failed to get wallet details: " + error_4.message + " " + (error_4.response ? error_4.response.data : ""));
                        }
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoindcxService.prototype.editFuturesOrder = function (_a) {
        var orderId = _a.orderId, total_quantity = _a.total_quantity, price = _a.price, take_profit_price = _a.take_profit_price, stop_loss_price = _a.stop_loss_price;
        return __awaiter(this, void 0, void 0, function () {
            var body, response, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        body = {
                            timestamp: this.getTimestamp(),
                            id: orderId,
                            total_quantity: total_quantity,
                            price: price,
                            take_profit_price: take_profit_price,
                            stop_loss_price: stop_loss_price
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].post(this.baseurl + "/exchange/v1/derivatives/futures/orders/edit", body, {
                                headers: this.getHeaders(body)
                            })];
                    case 2:
                        response = _b.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_5 = _b.sent();
                        if (axios_1["default"].isAxiosError(error_5)) {
                            throw new Error("Failed to edit futures order: " + error_5.message);
                        }
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoindcxService.prototype.updateTakeProfit = function (_a) {
        var orderId = _a.orderId, take_profit_price = _a.take_profit_price;
        return __awaiter(this, void 0, void 0, function () {
            var body, response, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        body = {
                            timestamp: this.getTimestamp(),
                            id: orderId,
                            take_profit_price: take_profit_price
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].post(this.baseurl + "/exchange/v1/derivatives/futures/orders/edit", body, {
                                headers: this.getHeaders(body)
                            })];
                    case 2:
                        response = _b.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_6 = _b.sent();
                        if (axios_1["default"].isAxiosError(error_6)) {
                            throw new Error("Failed to update take profit: " + error_6.message);
                        }
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoindcxService.prototype.updateStopLoss = function (_a) {
        var orderId = _a.orderId, stop_loss_price = _a.stop_loss_price;
        return __awaiter(this, void 0, void 0, function () {
            var body, response, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        body = {
                            timestamp: this.getTimestamp(),
                            id: orderId,
                            stop_loss_price: stop_loss_price
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].post(this.baseurl + "/exchange/v1/derivatives/futures/orders/edit", body, {
                                headers: this.getHeaders(body)
                            })];
                    case 2:
                        response = _b.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_7 = _b.sent();
                        if (axios_1["default"].isAxiosError(error_7)) {
                            throw new Error("Failed to update stop loss: " + error_7.message);
                        }
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoindcxService.prototype.getOrders = function (_a) {
        var status = _a.status, side = _a.side, page = _a.page, size = _a.size, _b = _a.margin_currency_short_name, margin_currency_short_name = _b === void 0 ? ["USDT"] : _b;
        return __awaiter(this, void 0, void 0, function () {
            var body, response, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = {
                            timestamp: this.getTimestamp(),
                            status: status,
                            side: side,
                            page: page,
                            size: size,
                            margin_currency_short_name: margin_currency_short_name
                        };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].post(this.baseurl + "/exchange/v1/derivatives/futures/orders", body, {
                                headers: this.getHeaders(body)
                            })];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_8 = _c.sent();
                        if (axios_1["default"].isAxiosError(error_8)) {
                            throw new Error("Failed to fetch orders: " + error_8.message);
                        }
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CoindcxService;
}());
exports.CoindcxService = CoindcxService;
