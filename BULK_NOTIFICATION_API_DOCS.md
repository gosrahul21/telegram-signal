# Bulk Notification & Read Status API Documentation

## 🚀 Overview

I've added comprehensive bulk notification and read status management functionality to your notification system. This includes:

- **Bulk read status updates** (mark multiple notifications as read)
- **Bulk archiving and deletion** operations
- **Notification statistics** and analytics
- **Advanced filtering and pagination**
- **Bulk notification sending** to multiple users
- **Automatic cleanup** of expired notifications

## 📡 New API Endpoints

### 1. **Get User Notifications** (with pagination & filtering)

```bash
GET /api/notifications
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`unread`, `read`, `archived`)
- `type` (optional): Filter by notification type
- `symbol` (optional): Filter by trading symbol

**Example:**

```bash
GET /api/notifications?page=1&limit=10&status=unread&type=alert_triggered&symbol=BTCUSDT
```

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "uuid": "uuid-123",
        "userId": "507f1f77bcf86cd799439011",
        "type": "alert_triggered",
        "status": "unread",
        "priority": "high",
        "title": "Alert triggered for BTCUSDT",
        "message": "Your alert (RSI_OVERBOUGHT) was triggered on BTCUSDT (1h).",
        "data": { "price": 43500, "rsi": 72.5 },
        "symbol": "BTCUSDT",
        "timeframe": "1h",
        "eventType": "RSI_OVERBOUGHT",
        "alertId": "alert_123",
        "readAt": null,
        "archivedAt": null,
        "tags": ["crypto", "rsi"],
        "metadata": { "confidence": 0.85 },
        "isPersistent": false,
        "expiresAt": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "totalPages": 3
  }
}
```

### 2. **Get Notification Statistics**

```bash
GET /api/notifications/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 100,
    "unread": 15,
    "read": 70,
    "archived": 15,
    "byType": {
      "alert_triggered": 45,
      "price_target": 30,
      "order_status": 15,
      "general": 10
    },
    "byPriority": {
      "high": 20,
      "medium": 60,
      "low": 20
    }
  }
}
```

### 3. **Mark Single Notification as Read**

```bash
PATCH /api/notifications/:id/read
```

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "read",
    "readAt": "2024-01-01T00:00:00.000Z"
    // ... other notification fields
  }
}
```

### 4. **Mark Multiple Notifications as Read** (Bulk)

```bash
PATCH /api/notifications/bulk/read
```

**Payload:**

```json
{
  "notificationIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Marked 3 notifications as read",
  "data": {
    "modifiedCount": 3
  }
}
```

### 5. **Mark All Notifications as Read**

```bash
PATCH /api/notifications/bulk/read-all
```

**Payload (optional filters):**

```json
{
  "type": "alert_triggered",
  "symbol": "BTCUSDT"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Marked 15 notifications as read",
  "data": {
    "modifiedCount": 15
  }
}
```

### 6. **Archive Single Notification**

```bash
PATCH /api/notifications/:id/archive
```

**Response:**

```json
{
  "success": true,
  "message": "Notification archived",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "archived",
    "archivedAt": "2024-01-01T00:00:00.000Z"
    // ... other notification fields
  }
}
```

### 7. **Archive Multiple Notifications** (Bulk)

```bash
PATCH /api/notifications/bulk/archive
```

**Payload:**

```json
{
  "notificationIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Archived 2 notifications",
  "data": {
    "modifiedCount": 2
  }
}
```

### 8. **Delete Single Notification**

```bash
DELETE /api/notifications/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

### 9. **Delete Multiple Notifications** (Bulk)

```bash
DELETE /api/notifications/bulk
```

**Payload:**

```json
{
  "notificationIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Deleted 2 notifications",
  "data": {
    "deletedCount": 2
  }
}
```

### 10. **Send Bulk Notifications** (Admin)

```bash
POST /api/notifications/bulk/send
```

**Payload:**

```json
{
  "userIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ],
  "type": "alert_triggered",
  "priority": "high",
  "title": "Market Alert",
  "message": "Important market update for all users",
  "data": {
    "marketCondition": "volatile",
    "recommendation": "exercise caution"
  },
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "eventType": "MARKET_ALERT",
  "alertId": "market_alert_123",
  "tags": ["market", "alert", "broadcast"],
  "metadata": {
    "source": "admin",
    "broadcast": true
  },
  "isPersistent": true,
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bulk notification sent: 3 created, 0 failed",
  "data": {
    "createdCount": 3,
    "failedCount": 0,
    "errors": []
  }
}
```

### 11. **Clean Up Expired Notifications** (Admin)

```bash
POST /api/notifications/cleanup/expired
```

**Response:**

```json
{
  "success": true,
  "message": "Cleaned up 25 expired notifications",
  "data": {
    "deletedCount": 25
  }
}
```

## 🎯 Frontend Integration Examples

### React Hook for Notifications

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Notification {
  _id: string;
  type: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  symbol?: string;
  createdAt: string;
  readAt?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch notifications with pagination and filtering
  const fetchNotifications = async (options = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(options);
      const response = await api.get(`/notifications?${params}`);
      setNotifications(response.data.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId
            ? { ...n, status: 'read', readAt: new Date().toISOString() }
            : n,
        ),
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark multiple notifications as read
  const markMultipleAsRead = async (notificationIds: string[]) => {
    try {
      await api.patch('/notifications/bulk/read', { notificationIds });
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n._id)
            ? { ...n, status: 'read', readAt: new Date().toISOString() }
            : n,
        ),
      );
    } catch (error) {
      console.error('Error marking multiple as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (filters = {}) => {
    try {
      await api.patch('/notifications/bulk/read-all', filters);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          status: 'read',
          readAt: new Date().toISOString(),
        })),
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Archive notification
  const archiveNotification = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/archive`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId
            ? { ...n, status: 'archived', archivedAt: new Date().toISOString() }
            : n,
        ),
      );
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchStats();
    }
  }, [user]);

  return {
    notifications,
    stats,
    loading,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
  };
};
```

### Notification Component Example

```typescript
import React, { useState } from 'react';
import { useNotifications } from './useNotifications';

export const NotificationList: React.FC = () => {
  const {
    notifications,
    stats,
    loading,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
  } = useNotifications();

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  const handleBulkMarkAsRead = () => {
    markMultipleAsRead(selectedNotifications);
    setSelectedNotifications([]);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setSelectedNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'read') return n.status === 'read';
    if (filter === 'archived') return n.status === 'archived';
    return true;
  });

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notification-list">
      {/* Header with stats and bulk actions */}
      <div className="notification-header">
        <div className="stats">
          <span>Total: {stats?.total || 0}</span>
          <span>Unread: {stats?.unread || 0}</span>
          <span>Read: {stats?.read || 0}</span>
        </div>

        <div className="bulk-actions">
          <button onClick={handleSelectAll}>
            {selectedNotifications.length === notifications.length ? 'Deselect All' : 'Select All'}
          </button>
          {selectedNotifications.length > 0 && (
            <button onClick={handleBulkMarkAsRead}>
              Mark {selectedNotifications.length} as Read
            </button>
          )}
          <button onClick={handleMarkAllAsRead}>Mark All as Read</button>
        </div>

        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Notification list */}
      <div className="notifications">
        {filteredNotifications.map(notification => (
          <div
            key={notification._id}
            className={`notification ${notification.status} ${notification.priority}`}
          >
            <input
              type="checkbox"
              checked={selectedNotifications.includes(notification._id)}
              onChange={() => handleSelectNotification(notification._id)}
            />

            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <div className="notification-meta">
                <span className="type">{notification.type}</span>
                <span className="symbol">{notification.symbol}</span>
                <span className="time">{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="notification-actions">
              {notification.status === 'unread' && (
                <button onClick={() => markAsRead(notification._id)}>
                  Mark as Read
                </button>
              )}
              <button onClick={() => archiveNotification(notification._id)}>
                Archive
              </button>
              <button onClick={() => deleteNotification(notification._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔧 Testing the New Endpoints

### Test Script for Bulk Operations

```javascript
// test-bulk-notifications.js
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

const headers = {
  Authorization: `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json',
};

async function testBulkOperations() {
  try {
    // 1. Get notifications
    console.log('📋 Fetching notifications...');
    const notificationsResponse = await axios.get(
      `${API_BASE_URL}/notifications`,
      { headers },
    );
    const notifications = notificationsResponse.data.data.notifications;
    console.log(`Found ${notifications.length} notifications`);

    // 2. Get stats
    console.log('📊 Fetching stats...');
    const statsResponse = await axios.get(
      `${API_BASE_URL}/notifications/stats`,
      { headers },
    );
    console.log('Stats:', statsResponse.data.data);

    // 3. Mark multiple as read
    if (notifications.length > 0) {
      const notificationIds = notifications.slice(0, 3).map((n) => n._id);
      console.log('✅ Marking multiple as read...');
      const markReadResponse = await axios.patch(
        `${API_BASE_URL}/notifications/bulk/read`,
        { notificationIds },
        { headers },
      );
      console.log('Mark read result:', markReadResponse.data);
    }

    // 4. Mark all as read
    console.log('✅ Marking all as read...');
    const markAllResponse = await axios.patch(
      `${API_BASE_URL}/notifications/bulk/read-all`,
      {},
      { headers },
    );
    console.log('Mark all result:', markAllResponse.data);

    // 5. Send bulk notification (if you have multiple user IDs)
    console.log('📤 Sending bulk notification...');
    const bulkNotificationResponse = await axios.post(
      `${API_BASE_URL}/notifications/bulk/send`,
      {
        userIds: ['507f1f77bcf86cd799439011'], // Replace with actual user IDs
        type: 'general',
        priority: 'medium',
        title: 'Bulk Test Notification',
        message: 'This is a test bulk notification',
        tags: ['test', 'bulk'],
        isPersistent: false,
      },
      { headers },
    );
    console.log('Bulk notification result:', bulkNotificationResponse.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testBulkOperations();
```

## 🎉 Key Benefits

✅ **Bulk Operations**: Efficiently manage multiple notifications at once
✅ **Advanced Filtering**: Filter by status, type, symbol, and more
✅ **Pagination**: Handle large notification lists efficiently
✅ **Statistics**: Get insights into notification patterns
✅ **Flexible Read Status**: Mark individual, multiple, or all notifications as read
✅ **Archive System**: Keep notifications without cluttering the main list
✅ **Automatic Cleanup**: Remove expired notifications automatically
✅ **Bulk Broadcasting**: Send notifications to multiple users efficiently
✅ **Error Handling**: Robust error handling for partial failures
✅ **Performance Optimized**: Uses MongoDB indexes for fast queries

This comprehensive notification system now provides all the functionality you need for managing notifications at scale!
