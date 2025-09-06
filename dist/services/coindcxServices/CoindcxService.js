"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoindcxService = void 0;
const axios_1 = require("axios");
const dotenv_1 = require("dotenv");
const getSignature_1 = require("./getSignature");
dotenv_1.default.config();
class CoindcxService {
    constructor() {
        this.baseurl = "https://api.coindcx.com";
        this.apiKey = process.env.COINDCX_API_KEY || "";
        this.secretKey = process.env.COINDCX_SECRET_KEY || "";
        if (!this.apiKey || !this.secretKey) {
            throw new Error("API credentials not found in environment variables");
        }
    }
    getTimestamp() {
        return Math.floor(Date.now());
    }
    getHeaders(body) {
        const signature = (0, getSignature_1.default)(body, this.secretKey);
        return {
            "X-AUTH-APIKEY": this.apiKey,
            "X-AUTH-SIGNATURE": signature,
        };
    }
    async getPositions() {
        const body = {
            timestamp: this.getTimestamp(),
            page: "1",
            size: "10",
            margin_currency_short_name: ["USDT", "INR"],
        };
        try {
            const response = await axios_1.default.post(this.baseurl + "/exchange/v1/derivatives/futures/positions", body, {
                headers: this.getHeaders(body),
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`API request failed: ${error.message}`);
            }
            throw error;
        }
    }
    async createFuturesOrder({ side, pair, order_type, price, stop_price, total_quantity, leverage, notification = "no_notification", time_in_force = "good_till_cancel", margin_currency_short_name = "USDT", position_margin_type, take_profit_price, stop_loss_price, }) {
        const body = {
            timestamp: this.getTimestamp(),
            order: {
                side,
                pair,
                order_type,
                price,
                stop_price,
                total_quantity,
                leverage,
                notification,
                time_in_force,
                margin_currency_short_name,
                position_margin_type,
                take_profit_price,
                stop_loss_price,
            },
        };
        try {
            const response = await axios_1.default.post(this.baseurl + "/exchange/v1/derivatives/futures/orders/create", body, {
                headers: this.getHeaders(body),
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to create futures order: ${error.message}`);
            }
            throw error;
        }
    }
    async cancelOrder({ orderId }) {
        const body = {
            timestamp: this.getTimestamp(),
            id: orderId,
        };
        try {
            const response = await axios_1.default.post(this.baseurl + "/exchange/v1/derivatives/futures/orders/cancel", body, {
                headers: this.getHeaders(body),
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to cancel order: ${error.message}`);
            }
            throw error;
        }
    }
    async getWalletDetails() {
        const body = {
            timestamp: this.getTimestamp(),
        };
        try {
            const response = await axios_1.default.get(this.baseurl + "/exchange/v1/derivatives/futures/wallets", {
                headers: this.getHeaders(body),
                params: body,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to get wallet details: ${error.message} ${error.response ? error.response.data : ""}`);
            }
            throw error;
        }
    }
    async editFuturesOrder({ orderId, total_quantity, price, take_profit_price, stop_loss_price, }) {
        const body = {
            timestamp: this.getTimestamp(),
            id: orderId,
            total_quantity,
            price,
            take_profit_price,
            stop_loss_price,
        };
        try {
            const response = await axios_1.default.post(this.baseurl + "/exchange/v1/derivatives/futures/orders/edit", body, {
                headers: this.getHeaders(body),
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to edit futures order: ${error.message}`);
            }
            throw error;
        }
    }
    async updateTakeProfit({ orderId, take_profit_price, }) {
        const body = {
            timestamp: this.getTimestamp(),
            id: orderId,
            take_profit_price,
        };
        try {
            const response = await axios_1.default.post(this.baseurl + "/exchange/v1/derivatives/futures/orders/edit", body, {
                headers: this.getHeaders(body),
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to update take profit: ${error.message}`);
            }
            throw error;
        }
    }
    async updateStopLoss({ orderId, stop_loss_price }) {
        const body = {
            timestamp: this.getTimestamp(),
            id: orderId,
            stop_loss_price,
        };
        try {
            const response = await axios_1.default.post(this.baseurl + "/exchange/v1/derivatives/futures/orders/edit", body, {
                headers: this.getHeaders(body),
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to update stop loss: ${error.message}`);
            }
            throw error;
        }
    }
    async getOrders({ status, side, page, size, margin_currency_short_name = ["USDT"], }) {
        const body = {
            timestamp: this.getTimestamp(),
            status,
            side,
            page,
            size,
            margin_currency_short_name,
        };
        try {
            const response = await axios_1.default.post(this.baseurl + "/exchange/v1/derivatives/futures/orders", body, {
                headers: this.getHeaders(body),
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to fetch orders: ${error.message}`);
            }
            throw error;
        }
    }
}
exports.CoindcxService = CoindcxService;
//# sourceMappingURL=CoindcxService.js.map