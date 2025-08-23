"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const connectToDatabase = async () => {
    try {
        const mongoURL = process.env.MONGODB_URL_PROD;
        await mongoose.connect(mongoURL);
        console.log('Connected to MongoDB successfully');
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
};
exports.default = connectToDatabase;
;
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});
mongoose.connection.on('reconnected', () => {
    console.log('Reconnected to MongoDB');
});
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
//# sourceMappingURL=connection.js.map