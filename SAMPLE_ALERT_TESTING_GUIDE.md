# Sample Alert Notification Testing Guide

## 🚀 Quick Start

I've created test endpoints to send sample alert notifications to your frontend via WebSocket. Here's how to test them:

## 📡 New Test Endpoints

### 1. **Sample RSI Alert**

```bash
POST /api/notifications/test/sample-alert
```

**Payload:**

```json
{
  "symbol": "BTCUSDT",
  "userId": "optional_user_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Sample alert broadcasted to all users",
  "alert": {
    "type": "alert_triggered",
    "data": {
      "alertId": "alert_1704067200000",
      "symbol": "BTCUSDT",
      "eventType": "RSI_OVERBOUGHT",
      "message": "RSI overbought alert triggered - BTC price is above 70 RSI",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "price": 43500.5,
      "rsi": 72.5,
      "volume": 1250000,
      "timeframe": "1h",
      "priority": "high",
      "metadata": {
        "source": "technical_analysis",
        "confidence": 0.85,
        "recommendation": "Consider taking profits or setting stop-loss"
      }
    }
  }
}
```

### 2. **Price Alert**

```bash
POST /api/notifications/test/price-alert
```

**Payload:**

```json
{
  "symbol": "ETHUSDT",
  "price": 3200,
  "userId": "optional_user_id"
}
```

### 3. **Order Update**

```bash
POST /api/notifications/test/order-update
```

**Payload:**

```json
{
  "symbol": "BTCUSDT",
  "userId": "optional_user_id"
}
```

## 🧪 Testing Methods

### Method 1: Using the Test Script

1. **Get a JWT Token:**

   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "your_username", "password": "your_password"}'
   ```

2. **Update the test script:**
   - Open `test-sample-alerts.js`
   - Replace `YOUR_JWT_TOKEN_HERE` with your actual JWT token

3. **Run the test script:**
   ```bash
   node test-sample-alerts.js
   ```

### Method 2: Using Postman

1. **Set up authentication:**
   - Add `Authorization: Bearer YOUR_JWT_TOKEN` header
   - Set `Content-Type: application/json`

2. **Send test requests:**

   ```bash
   # Sample RSI Alert
   POST http://localhost:3000/api/notifications/test/sample-alert
   Body: {"symbol": "BTCUSDT"}

   # Price Alert
   POST http://localhost:3000/api/notifications/test/price-alert
   Body: {"symbol": "ETHUSDT", "price": 3200}

   # Order Update
   POST http://localhost:3000/api/notifications/test/order-update
   Body: {"symbol": "BTCUSDT"}
   ```

### Method 3: Using curl

```bash
# Sample RSI Alert
curl -X POST http://localhost:3000/api/notifications/test/sample-alert \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT"}'

# Price Alert
curl -X POST http://localhost:3000/api/notifications/test/price-alert \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "ETHUSDT", "price": 3200}'

# Order Update
curl -X POST http://localhost:3000/api/notifications/test/order-update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT"}'
```

## 📱 Frontend Testing

### 1. **Connect to WebSocket**

Make sure your frontend is connected to the WebSocket with proper authentication:

```typescript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN',
  },
});
```

### 2. **Listen for Notifications**

```typescript
// Listen for all notifications
socket.on('notification', (data) => {
  console.log('📨 Notification received:', data);
  // Handle the notification in your UI
});

// Listen for order updates
socket.on('order_update', (data) => {
  console.log('📋 Order update received:', data);
  // Handle order updates in your UI
});
```

### 3. **Test with Your React Component**

If you're using the `WebSocketTestComponent` I provided earlier, you should see the notifications appear in the notifications list when you send test alerts.

## 🔍 Expected Behavior

### When you send a test alert:

1. **Backend logs:**

   ```
   Sending notification to user 507f1f77bcf86cd799439011: { type: 'alert_triggered', data: {...} }
   Message sent to 1 socket(s) for user 507f1f77bcf86cd799439011
   ```

2. **Frontend console:**

   ```
   📨 Notification received: {
     type: "alert_triggered",
     data: {
       alertId: "alert_1704067200000",
       symbol: "BTCUSDT",
       eventType: "RSI_OVERBOUGHT",
       message: "RSI overbought alert triggered - BTC price is above 70 RSI",
       timestamp: "2024-01-01T00:00:00.000Z",
       price: 43500.50,
       rsi: 72.5,
       volume: 1250000,
       timeframe: "1h",
       priority: "high"
     }
   }
   ```

3. **UI updates:**
   - Notification appears in your notifications list
   - Alert count increases
   - Real-time updates show in the interface

## 🎯 Sample Alert Types

### 1. **RSI Overbought Alert**

- **Type:** `alert_triggered`
- **Event:** `RSI_OVERBOUGHT`
- **Data:** Price, RSI value, volume, timeframe
- **Priority:** High
- **Recommendation:** Take profits or set stop-loss

### 2. **Price Alert**

- **Type:** `price_alert`
- **Event:** `PRICE_ABOVE`
- **Data:** Current price, target price, change percentage
- **Priority:** Medium
- **Trend:** Bullish/Bearish

### 3. **Order Update**

- **Type:** `order_update`
- **Event:** Order status change
- **Data:** Order ID, status, quantity, price, fees
- **Exchange:** Binance
- **Order Type:** Market/Limit

## 🛠️ Troubleshooting

### Issue 1: "No active sockets found for user"

**Solution:** Make sure the user is connected to WebSocket with valid JWT token

### Issue 2: "Unauthorized" error

**Solution:** Check that your JWT token is valid and not expired

### Issue 3: Frontend not receiving notifications

**Solution:**

- Verify WebSocket connection is established
- Check browser console for connection errors
- Ensure you're listening for the correct event names

### Issue 4: Notifications not appearing in UI

**Solution:**

- Check if your frontend is properly handling the `notification` event
- Verify the notification state management is working
- Check for any JavaScript errors in the console

## 📊 Monitoring

### Backend Logs

Watch your backend console for:

- WebSocket connection logs
- Authentication logs
- Notification sending logs

### Frontend Logs

Check browser console for:

- WebSocket connection status
- Received notifications
- Any error messages

## 🎉 Success Indicators

✅ **Backend:** Returns `success: true` with alert data
✅ **WebSocket:** Logs show message sent to user
✅ **Frontend:** Console shows notification received
✅ **UI:** Notification appears in the interface
✅ **Real-time:** Updates happen instantly without page refresh

## 🔄 Next Steps

1. **Test all three alert types** (RSI, Price, Order)
2. **Test both broadcast and user-specific** notifications
3. **Verify real-time updates** in your frontend
4. **Test with multiple users** connected simultaneously
5. **Integrate with your actual alert system** when ready

This testing setup will help you verify that your WebSocket notifications are working correctly before integrating with your real trading signals!
