import * as mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
        unique: true,
    },
    telegramId: {
        type: Number,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    subscriptions: [{
        pairName: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            enum: ['1h', '4h', '1d'],
            required: true,
        },
    }],
    alertTypes: {
        type: [String],
        default: ['EMA', 'RSI', 'BB'],
    },
    subscribedPairs: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Create the User model using the schema
export const User = mongoose.model('User', userSchema);

export interface IUser {
    chatId: number;
    telegramId: number;
    username: string;
    alertTypes?: string[];
    subscribedPairs?: string[];
    subscriptions?: { pairName: string; duration: string }[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type UserDocument = mongoose.Document & IUser;
