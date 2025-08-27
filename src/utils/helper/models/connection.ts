// Import Mongoose
const mongoose = require('mongoose');

// Define the connection URL to the MongoDB database


// Define Mongoose connection options

// Function to connect to the MongoDB database
const connectToDatabase = async () => {
    try {
        const mongoURL = process.env.MONGODB_URL_PROD!; // Replace 'yourDatabaseName' with your actual database name
        // Establish the connection
        await mongoose.connect(mongoURL);

        // Log a message indicating a successful connection
        console.log('Connected to MongoDB successfully');

    } catch (error) {
        // Handle connection errors
        console.error('Failed to connect to MongoDB:', error);
    }
};

// Export the connectToDatabase function so it can be used in other parts of your application
export default connectToDatabase;;

// You can also set up event handlers for the connection

// Event handler for when the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

// Event handler for when the connection is reconnected
mongoose.connection.on('reconnected', () => {
    console.log('Reconnected to MongoDB');
});

// Event handler for any connection errors
mongoose.connection.on('error', (error: Error) => {
    console.error('MongoDB connection error:', error);
});
