"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var mongoose = __importStar(require("mongoose"));
// Define the User schema
var userSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
        unique: true
    },
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    subscriptions: [{
            pairName: {
                type: String,
                required: true
            },
            duration: {
                type: String,
                "enum": ['1h', '4h', '1d'],
                required: true
            }
        }],
    // You can add more fields as needed
    createdAt: {
        type: Date,
        "default": Date.now
    },
    updatedAt: {
        type: Date,
        "default": Date.now
    }
});
// Create the User model using the schema
exports.User = mongoose.model('User', userSchema);
