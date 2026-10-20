"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Import Mongoose
const mongoose = require('mongoose');
// Define the connection URL to the MongoDB database
// Define Mongoose connection options
// Function to connect to the MongoDB database
const connectToDatabase = async () => {
    try {
        const mongoURL = process.env.MONGODB_URL_PROD; // Replace 'yourDatabaseName' with your actual database name
        // Establish the connection
        await mongoose.connect(mongoURL);
        // Log a message indicating a successful connection
        console.log('Connected to MongoDB successfully');
    }
    catch (error) {
        // Handle connection errors
        console.error('Failed to connect to MongoDB:', error);
    }
};
// Export the connectToDatabase function so it can be used in other parts of your application
exports.default = connectToDatabase;
;
// You can also set up event handlers for the connection
// Event handler for when the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});
// Event handler for when the connection is reconnected
mongoose.connection.on('reconnected', async () => {
    console.log('Reconnected to MongoDB');
    try {
        const userRepository = (await Promise.resolve().then(() => __importStar(require("../repositories/userRepository")))).default;
        await userRepository.fetchSubscribedUsers();
    }
    catch (err) {
        console.error('Failed to refresh subscribers on reconnect:', err);
    }
});
// Event handler for any connection errors
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
