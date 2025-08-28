const mongoose = require('mongoose');
require('dotenv').config();

async function removeChatIdIndex() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URL_PROD;
    if (!mongoUri) {
      console.error('MONGODB_URL_PROD environment variable is not set');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Get the database instance
    const db = mongoose.connection.db;

    // Get the users collection
    const usersCollection = db.collection('users');

    // List all indexes to see the current state
    console.log('\nCurrent indexes on users collection:');
    const indexes = await usersCollection.indexes();
    indexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Check if chatId index exists
    const chatIdIndex = indexes.find(
      (index) => index.key.telegramId === 1 || index.key.telegramId === -1,
    );

    if (chatIdIndex) {
      console.log(`\nFound chatId index: ${chatIdIndex.name}`);
      console.log('Removing chatId index...');

      // Drop the chatId index
      await usersCollection.dropIndex(chatIdIndex.name);
      console.log('✅ chatId index removed successfully');
    } else {
      console.log('\n✅ No chatId index found - nothing to remove');
    }

    // List indexes again to confirm removal
    console.log('\nUpdated indexes on users collection:');
    const updatedIndexes = await usersCollection.indexes();
    updatedIndexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });
  } catch (error) {
    console.error('❌ Error removing chatId index:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  }
}

// Run the script
removeChatIdIndex();
