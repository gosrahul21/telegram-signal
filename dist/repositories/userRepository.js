"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ALERT_TYPES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const user_1 = require("../models/user");
exports.DEFAULT_ALERT_TYPES = ["EMA", "RSI", "BB"];
/**
 * Repository to manage subscribed users, alert preferences, and persistence.
 */
class UserRepository {
    constructor() {
        this.subscribedUsers = [];
        this.fetchSubscribedUsers();
    }
    /**
     * Add a new subscriber or update an existing one
     */
    async addUser(userData) {
        try {
            const existingUser = this.subscribedUsers.find((u) => u.chatId === userData.chatId);
            if (existingUser) {
                return existingUser;
            }
            const defaultData = {
                ...userData,
                alertTypes: userData.alertTypes || exports.DEFAULT_ALERT_TYPES,
                subscribedPairs: userData.subscribedPairs || config_1.default.BINANCE_KEY_PAIRS,
            };
            const newUser = new user_1.User(defaultData);
            const savedUser = await newUser.save();
            const userObj = savedUser.toObject();
            this.subscribedUsers.push(userObj);
            return userObj;
        }
        catch (error) {
            console.error("Error adding user:", error);
            throw error;
        }
    }
    /**
     * Get all subscribed users
     */
    getSubscribedUsers() {
        return this.subscribedUsers;
    }
    /**
     * Filter subscribed users who have BOTH the given alertType and symbol enabled
     */
    getSubscribedUsersFor(symbol, alertType) {
        const normSymbol = symbol.toUpperCase();
        const normAlert = alertType.toUpperCase();
        return this.subscribedUsers.filter((user) => {
            const alertTypes = user.alertTypes !== undefined
                ? user.alertTypes
                : exports.DEFAULT_ALERT_TYPES;
            const pairs = user.subscribedPairs !== undefined
                ? user.subscribedPairs
                : config_1.default.BINANCE_KEY_PAIRS;
            const hasAlert = alertTypes.some((t) => t.toUpperCase() === normAlert);
            const hasSymbol = pairs.some((p) => p.toUpperCase() === normSymbol);
            return hasAlert && hasSymbol;
        });
    }
    /**
     * Retrieve preferences for a given user
     */
    getUserPreferences(chatId) {
        const user = this.subscribedUsers.find((u) => u.chatId === chatId);
        if (!user) {
            return {
                alertTypes: [...exports.DEFAULT_ALERT_TYPES],
                subscribedPairs: [...config_1.default.BINANCE_KEY_PAIRS],
            };
        }
        return {
            alertTypes: user.alertTypes !== undefined
                ? [...user.alertTypes]
                : [...exports.DEFAULT_ALERT_TYPES],
            subscribedPairs: user.subscribedPairs !== undefined
                ? [...user.subscribedPairs]
                : [...config_1.default.BINANCE_KEY_PAIRS],
        };
    }
    async persistUser(chatId, update) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                await user_1.User.findOneAndUpdate({ chatId }, update, { new: true });
            }
        }
        catch (err) {
            console.error(`Failed to persist user preferences for ${chatId}:`, err);
        }
    }
    /**
     * Toggle an alert type (e.g., 'EMA', 'RSI', 'BB') for a user
     */
    async toggleAlertType(chatId, alertType) {
        const normAlert = alertType.toUpperCase();
        let user = this.subscribedUsers.find((u) => u.chatId === chatId);
        if (!user) {
            user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...exports.DEFAULT_ALERT_TYPES], subscribedPairs: [...config_1.default.BINANCE_KEY_PAIRS] };
            this.subscribedUsers.push(user);
        }
        let alertTypes = user.alertTypes ? [...user.alertTypes] : [...exports.DEFAULT_ALERT_TYPES];
        const exists = alertTypes.some((t) => t.toUpperCase() === normAlert);
        if (exists) {
            alertTypes = alertTypes.filter((t) => t.toUpperCase() !== normAlert);
        }
        else {
            alertTypes.push(normAlert);
        }
        user.alertTypes = alertTypes;
        await this.persistUser(chatId, { alertTypes });
        return !exists;
    }
    /**
     * Toggle a symbol (e.g., 'BTCUSDT', 'SOLUSDT') for a user
     */
    async toggleSymbol(chatId, symbol) {
        const normSymbol = symbol.toUpperCase();
        let user = this.subscribedUsers.find((u) => u.chatId === chatId);
        if (!user) {
            user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...exports.DEFAULT_ALERT_TYPES], subscribedPairs: [...config_1.default.BINANCE_KEY_PAIRS] };
            this.subscribedUsers.push(user);
        }
        let pairs = user.subscribedPairs ? [...user.subscribedPairs] : [...config_1.default.BINANCE_KEY_PAIRS];
        const exists = pairs.some((p) => p.toUpperCase() === normSymbol);
        if (exists) {
            pairs = pairs.filter((p) => p.toUpperCase() !== normSymbol);
        }
        else {
            pairs.push(normSymbol);
        }
        user.subscribedPairs = pairs;
        await this.persistUser(chatId, { subscribedPairs: pairs });
        return !exists;
    }
    /**
     * Set specific alert type status
     */
    async setAlertType(chatId, alertType, enabled) {
        const normAlert = alertType.toUpperCase();
        let user = this.subscribedUsers.find((u) => u.chatId === chatId);
        if (!user) {
            user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...exports.DEFAULT_ALERT_TYPES], subscribedPairs: [...config_1.default.BINANCE_KEY_PAIRS] };
            this.subscribedUsers.push(user);
        }
        let alertTypes = user.alertTypes ? [...user.alertTypes] : [...exports.DEFAULT_ALERT_TYPES];
        alertTypes = alertTypes.filter((t) => t.toUpperCase() !== normAlert);
        if (enabled) {
            alertTypes.push(normAlert);
        }
        user.alertTypes = alertTypes;
        await this.persistUser(chatId, { alertTypes });
    }
    /**
     * Set specific symbol status
     */
    async setSymbol(chatId, symbol, enabled) {
        const normSymbol = symbol.toUpperCase();
        let user = this.subscribedUsers.find((u) => u.chatId === chatId);
        if (!user) {
            user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...exports.DEFAULT_ALERT_TYPES], subscribedPairs: [...config_1.default.BINANCE_KEY_PAIRS] };
            this.subscribedUsers.push(user);
        }
        let pairs = user.subscribedPairs ? [...user.subscribedPairs] : [...config_1.default.BINANCE_KEY_PAIRS];
        pairs = pairs.filter((p) => p.toUpperCase() !== normSymbol);
        if (enabled) {
            pairs.push(normSymbol);
        }
        user.subscribedPairs = pairs;
        await this.persistUser(chatId, { subscribedPairs: pairs });
    }
    /**
     * Enable all alerts and symbols for a user
     */
    async enableAll(chatId) {
        let user = this.subscribedUsers.find((u) => u.chatId === chatId);
        if (!user) {
            user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...exports.DEFAULT_ALERT_TYPES], subscribedPairs: [...config_1.default.BINANCE_KEY_PAIRS] };
            this.subscribedUsers.push(user);
        }
        user.alertTypes = [...exports.DEFAULT_ALERT_TYPES];
        user.subscribedPairs = [...config_1.default.BINANCE_KEY_PAIRS];
        await this.persistUser(chatId, { alertTypes: user.alertTypes, subscribedPairs: user.subscribedPairs });
    }
    /**
     * Disable all alerts and symbols for a user
     */
    async disableAll(chatId) {
        let user = this.subscribedUsers.find((u) => u.chatId === chatId);
        if (!user) {
            user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [], subscribedPairs: [] };
            this.subscribedUsers.push(user);
        }
        user.alertTypes = [];
        user.subscribedPairs = [];
        await this.persistUser(chatId, { alertTypes: [], subscribedPairs: [] });
    }
    /**
     * Delete a subscriber
     */
    async deleteUser(chatId) {
        try {
            const deletedUser = await user_1.User.findOneAndDelete({ chatId }).lean();
            if (deletedUser) {
                this.subscribedUsers = this.subscribedUsers.filter((u) => u.chatId !== chatId);
            }
            return deletedUser;
        }
        catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }
    async updateUser(userId, updateData) {
        try {
            const updatedUser = await user_1.User.findByIdAndUpdate(userId, updateData, {
                new: true,
            }).lean();
            return updatedUser;
        }
        catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }
    async getUserById(userId) {
        try {
            return await user_1.User.findById(userId).lean();
        }
        catch (error) {
            console.error("Error retrieving user:", error);
            throw error;
        }
    }
    async getUserByChatId(chatId) {
        try {
            return await user_1.User.findOne({ chatId: Number(chatId) }).lean();
        }
        catch (error) {
            console.error("Error retrieving user:", error);
            throw error;
        }
    }
    async fetchSubscribedUserFromDb() {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await user_1.User.find({}).lean();
            }
            return [];
        }
        catch (error) {
            console.error("Get subscribed users:", error);
            return [];
        }
    }
    async fetchSubscribedUsers() {
        const users = await this.fetchSubscribedUserFromDb();
        if (users && users.length > 0) {
            this.subscribedUsers = users;
        }
    }
}
exports.default = new UserRepository();
