# Frontend WebSocket Connection Fix

## Problem Identified

Your frontend connection is not reaching the backend due to several issues in the WebSocket URL construction and authentication method.

## Issues Found

### 1. **Incorrect WebSocket URL Format**

```typescript
// ❌ WRONG - This is not a valid WebSocket URL
const websocketUrl = `http://localhost:3000?token=${jwt}`;

// ✅ CORRECT - Proper WebSocket URL
const websocketUrl = 'ws://localhost:3000';
```

### 2. **Wrong Authentication Method**

```typescript
// ❌ WRONG - Passing token in URL query parameter
const websocketUrl = `http://localhost:3000?token=${jwt}`;

// ✅ CORRECT - Pass token in auth object
const socket = io(websocketUrl, {
  auth: {
    token: jwtToken,
  },
});
```

### 3. **Missing Socket.io-client Import**

Your NotificationProvider needs to import and use `socket.io-client`.

## Solutions Applied

### 1. **Fixed AuthProvider** (`AuthProvider-fixed.tsx`)

**Key Changes:**

- ✅ Proper WebSocket URL construction (`ws://` or `wss://`)
- ✅ Pass JWT token separately to NotificationProvider
- ✅ Fixed API endpoint paths (added `/api` prefix)

### 2. **Fixed NotificationProvider** (`NotificationProvider-fixed.tsx`)

**Key Changes:**

- ✅ Proper socket.io-client usage
- ✅ Correct authentication with `auth.token`
- ✅ Comprehensive event handling
- ✅ Better error handling and logging

### 3. **Test Component** (`WebSocketTestComponent.tsx`)

**Features:**

- ✅ Real-time connection status
- ✅ Test buttons for all WebSocket events
- ✅ Notification display
- ✅ Debug information

## Implementation Steps

### Step 1: Update Your AuthProvider

Replace your current AuthProvider with the fixed version:

```typescript
// Replace your buildWebSocketUrl function with:
const buildWebSocketUrl = (): string => {
  const backendUri = import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";

  try {
    const url = new URL(backendUri);
    const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${url.host}`;
  } catch (error) {
    console.error("Error building WebSocket URL:", error);
    return "ws://localhost:3000";
  }
};

// Pass JWT token separately:
<NotificationProvider
  websocketUrl={websocketUrl}
  jwtToken={jwt} // Pass JWT token separately
>
```

### Step 2: Update Your NotificationProvider

Replace your NotificationProvider with the fixed version that:

- Uses `socket.io-client` properly
- Sends JWT token in `auth.token`
- Handles all WebSocket events
- Provides better debugging

### Step 3: Add Test Component

Add the WebSocketTestComponent to your app to verify the connection:

```typescript
import { WebSocketTestComponent } from './WebSocketTestComponent';

// In your main component:
<WebSocketTestComponent />
```

### Step 4: Install Required Dependencies

Make sure you have socket.io-client installed:

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

## Testing the Fix

### 1. **Check Browser Console**

- Look for WebSocket connection logs
- Verify JWT token is being sent
- Check for any error messages

### 2. **Check Backend Logs**

- Look for authentication middleware logs
- Verify connection attempts are reaching the backend
- Check for JWT verification logs

### 3. **Use Test Component**

- Verify connection status shows "Connected"
- Test sending ping messages
- Check if notifications are received

## Common Issues and Solutions

### Issue 1: "WebSocket connection failed"

**Solution:** Check if backend is running and CORS is configured correctly

### Issue 2: "Authentication error"

**Solution:** Verify JWT token is valid and not expired

### Issue 3: "Connection timeout"

**Solution:** Check network connectivity and firewall settings

## Debug Checklist

- [ ] Backend server is running on port 3000
- [ ] JWT token is valid and not expired
- [ ] WebSocket URL is correct (`ws://localhost:3000`)
- [ ] JWT token is passed in `auth.token`, not URL
- [ ] socket.io-client is installed
- [ ] CORS is configured in backend
- [ ] Browser console shows connection logs
- [ ] Backend logs show connection attempts

## Environment Variables

Make sure these are set correctly:

```bash
# Frontend (.env)
VITE_BACKEND_URI=http://localhost:3000

# Backend (.env)
JWT_SECRET=your-secret-key
PORT=3000
```

## Quick Test Commands

```bash
# Test WebSocket endpoint directly
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" http://localhost:3000

# Test with wscat (if installed)
wscat -c ws://localhost:3000

# Check if port is listening
netstat -an | grep 3000
```

## Expected Behavior After Fix

1. **Frontend connects successfully** to WebSocket
2. **Backend logs show** authentication success
3. **Test component shows** "Connected" status
4. **Ping messages work** and get responses
5. **Notifications are received** in real-time

## Still Having Issues?

1. **Check browser Network tab** for WebSocket connection attempts
2. **Verify JWT token** by decoding it at jwt.io
3. **Test with Postman WebSocket** to confirm backend works
4. **Check backend CORS configuration** matches your frontend URL
5. **Verify socket.io versions** are compatible between frontend and backend
