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
        // Add any additional fields you need for the subscription here
    }],
    // You can add more fields as needed
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

export type UserDocument = typeof User & mongoose.Document;
