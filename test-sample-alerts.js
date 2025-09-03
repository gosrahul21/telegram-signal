// Test script to send sample alert notifications to frontend
// Run this script to test WebSocket notifications

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// You'll need to get a valid JWT token first by logging in
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

const headers = {
  Authorization: `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json',
};

async function sendSampleAlert() {
  try {
    console.log('🚨 Sending sample RSI alert...');

    const response = await axios.post(
      `${API_BASE_URL}/notifications/test/sample-alert`,
      {
        symbol: 'BTCUSDT',
      },
      { headers },
    );

    console.log('✅ Sample alert sent successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      '❌ Error sending sample alert:',
      error.response?.data || error.message,
    );
  }
}

async function sendPriceAlert() {
  try {
    console.log('💰 Sending price alert...');

    const response = await axios.post(
      `${API_BASE_URL}/notifications/test/price-alert`,
      {
        symbol: 'ETHUSDT',
        price: 3200,
      },
      { headers },
    );

    console.log('✅ Price alert sent successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      '❌ Error sending price alert:',
      error.response?.data || error.message,
    );
  }
}

async function sendOrderUpdate() {
  try {
    console.log('📋 Sending order update...');

    const response = await axios.post(
      `${API_BASE_URL}/notifications/test/order-update`,
      {
        symbol: 'BTCUSDT',
      },
      { headers },
    );

    console.log('✅ Order update sent successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      '❌ Error sending order update:',
      error.response?.data || error.message,
    );
  }
}

async function sendToSpecificUser(userId) {
  try {
    console.log(`👤 Sending alert to specific user: ${userId}`);

    const response = await axios.post(
      `${API_BASE_URL}/notifications/test/sample-alert`,
      {
        userId: userId,
        symbol: 'ADAUSDT',
      },
      { headers },
    );

    console.log('✅ User-specific alert sent successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      '❌ Error sending user-specific alert:',
      error.response?.data || error.message,
    );
  }
}

// Main function to run all tests
async function runTests() {
  console.log('🧪 Starting WebSocket notification tests...\n');

  if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Please set a valid JWT_TOKEN in the script first!');
    console.log(
      '   You can get a token by logging in via: POST /api/auth/login',
    );
    return;
  }

  // Test 1: Sample RSI Alert (broadcast to all)
  await sendSampleAlert();
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Price Alert (broadcast to all)
  await sendPriceAlert();
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Order Update (broadcast to all)
  await sendOrderUpdate();
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Send to specific user (replace with actual user ID)
  // await sendToSpecificUser('507f1f77bcf86cd799439011');
  // console.log('\n' + '='.repeat(50) + '\n');

  console.log('🎉 All tests completed!');
  console.log(
    '\n📱 Check your frontend WebSocket connection to see the notifications!',
  );
}

// Run the tests
runTests().catch(console.error);
