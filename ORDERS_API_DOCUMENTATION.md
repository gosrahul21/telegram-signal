# Orders API Documentation

## 🚀 Overview

I've created a comprehensive order management system for your trading application that supports multiple exchanges (Binance, Upstox, CoinDCX) and various order types. The system includes:

- **Multi-exchange support** (Binance, Upstox, CoinDCX, Manual)
- **Comprehensive order types** (Market, Limit, Stop Loss, Take Profit, OCO, etc.)
- **Order lifecycle management** (Pending → Submitted → Filled/Canceled)
- **Bulk operations** (Create, Update, Cancel multiple orders)
- **Risk management** (Position sizing, stop loss, take profit)
- **Performance tracking** (PnL calculation, statistics)
- **Audit trail** (Complete order history)
- **Retry mechanism** (Failed order retry with exponential backoff)

## 📊 Order Schema Features

### **Order Status Flow**

```
PENDING → SUBMITTED → NEW → PARTIALLY_FILLED → FILLED
    ↓         ↓        ↓           ↓
CANCELED  REJECTED  EXPIRED    FAILED
```

### **Supported Exchanges**

- **Binance** - Crypto trading
- **Upstox** - Stock trading
- **CoinDCX** - Crypto trading
- **Manual** - Paper trading or manual orders

### **Order Types**

- **MARKET** - Execute immediately at market price
- **LIMIT** - Execute at specified price or better
- **STOP_LOSS** - Trigger when price reaches stop level
- **STOP_LOSS_LIMIT** - Stop loss with limit price
- **TAKE_PROFIT** - Take profit at specified price
- **TAKE_PROFIT_LIMIT** - Take profit with limit price
- **OCO** - One-Cancels-Other (bracket orders)
- **TRAILING_STOP** - Dynamic stop loss

## 📡 API Endpoints

### **1. Create Order**

```bash
POST /api/orders
```

**Payload:**

```json
{
  "exchange": "binance",
  "symbol": "BTCUSDT",
  "side": "BUY",
  "type": "LIMIT",
  "quantity": 0.001,
  "price": 45000,
  "timeInForce": "GTC",
  "source": "signal",
  "priority": "high",
  "signalId": "signal_123",
  "alertId": "alert_456",
  "strategyId": "strategy_789",
  "notes": "RSI oversold signal",
  "tags": ["crypto", "rsi", "oversold"],
  "maxRiskAmount": 100,
  "positionSize": 0.001,
  "isPaperTrade": false,
  "validUntil": "2024-12-31T23:59:59.000Z",
  "metadata": {
    "signalData": {
      "indicator": "RSI",
      "timeframe": "1h",
      "confidence": 0.85,
      "rsi": 25.5
    },
    "riskManagement": {
      "maxRisk": 100,
      "riskRewardRatio": 2.5,
      "stopLossPercentage": 2,
      "takeProfitPercentage": 5
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "uuid": "uuid-123",
    "userId": "507f1f77bcf86cd799439011",
    "exchange": "binance",
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "status": "PENDING",
    "timeInForce": "GTC",
    "source": "signal",
    "priority": "high",
    "quantity": 0.001,
    "price": 45000,
    "filledQuantity": 0,
    "averagePrice": 0,
    "totalFees": 0,
    "signalId": "signal_123",
    "alertId": "alert_456",
    "strategyId": "strategy_789",
    "notes": "RSI oversold signal",
    "tags": ["crypto", "rsi", "oversold"],
    "maxRiskAmount": 100,
    "positionSize": 0.001,
    "isPaperTrade": false,
    "validUntil": "2024-12-31T23:59:59.000Z",
    "retryCount": 0,
    "maxRetries": 3,
    "auditTrail": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **2. Get Orders (with pagination & filtering)**

```bash
GET /api/orders?page=1&limit=20&exchange=binance&symbol=BTCUSDT&status=FILLED&side=BUY&type=LIMIT&source=signal&priority=high&startDate=2024-01-01&endDate=2024-01-31&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `exchange` (optional): Filter by exchange
- `symbol` (optional): Filter by trading symbol
- `side` (optional): Filter by order side (BUY/SELL)
- `type` (optional): Filter by order type
- `status` (optional): Filter by order status
- `source` (optional): Filter by order source
- `priority` (optional): Filter by priority
- `signalId` (optional): Filter by signal ID
- `alertId` (optional): Filter by alert ID
- `strategyId` (optional): Filter by strategy ID
- `clientOrderId` (optional): Filter by client order ID
- `exchangeOrderId` (optional): Filter by exchange order ID
- `isPaperTrade` (optional): Filter paper trades
- `isBacktest` (optional): Filter backtest orders
- `tag` (optional): Filter by tag
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "uuid": "uuid-123",
        "userId": "507f1f77bcf86cd799439011",
        "exchange": "binance",
        "symbol": "BTCUSDT",
        "side": "BUY",
        "type": "LIMIT",
        "status": "FILLED",
        "quantity": 0.001,
        "price": 45000,
        "filledQuantity": 0.001,
        "averagePrice": 44950,
        "totalFees": 0.45,
        "exchangeOrderId": "binance_123456",
        "submittedAt": "2024-01-01T00:01:00.000Z",
        "filledAt": "2024-01-01T00:02:00.000Z",
        "pnl": 5.0,
        "pnlPercentage": 0.11,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:02:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "totalPages": 8
  }
}
```

### **3. Get Order by ID**

```bash
GET /api/orders/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "uuid": "uuid-123",
    "userId": "507f1f77bcf86cd799439011",
    "exchange": "binance",
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "status": "FILLED",
    "quantity": 0.001,
    "price": 45000,
    "filledQuantity": 0.001,
    "averagePrice": 44950,
    "totalFees": 0.45,
    "exchangeOrderId": "binance_123456",
    "clientOrderId": "client_123",
    "signalId": "signal_123",
    "alertId": "alert_456",
    "strategyId": "strategy_789",
    "notes": "RSI oversold signal",
    "tags": ["crypto", "rsi", "oversold"],
    "metadata": {
      "signalData": {
        "indicator": "RSI",
        "timeframe": "1h",
        "confidence": 0.85,
        "rsi": 25.5
      }
    },
    "submittedAt": "2024-01-01T00:01:00.000Z",
    "filledAt": "2024-01-01T00:02:00.000Z",
    "pnl": 5.0,
    "pnlPercentage": 0.11,
    "auditTrail": [
      "2024-01-01T00:00:00.000Z: Order created",
      "2024-01-01T00:01:00.000Z: Order submitted to exchange",
      "2024-01-01T00:02:00.000Z: Order filled"
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:02:00.000Z"
  }
}
```

### **4. Update Order**

```bash
PUT /api/orders/:id
```

**Payload:**

```json
{
  "quantity": 0.002,
  "price": 46000,
  "priority": "critical",
  "notes": "Updated order parameters",
  "tags": ["crypto", "rsi", "oversold", "updated"]
}
```

### **5. Cancel Order**

```bash
PATCH /api/orders/:id/cancel
```

**Payload:**

```json
{
  "reason": "Market conditions changed"
}
```

### **6. Delete Order**

```bash
DELETE /api/orders/:id
```

### **7. Get Order Statistics**

```bash
GET /api/orders/stats/overview
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 500,
    "byStatus": {
      "FILLED": 350,
      "CANCELED": 100,
      "PENDING": 25,
      "REJECTED": 15,
      "FAILED": 10
    },
    "byExchange": {
      "binance": 300,
      "upstox": 150,
      "coindcx": 50
    },
    "bySide": {
      "BUY": 250,
      "SELL": 250
    },
    "byType": {
      "LIMIT": 300,
      "MARKET": 150,
      "STOP_LOSS": 50
    },
    "totalVolume": 12.5,
    "totalFees": 125.5,
    "totalPnL": 2500.75,
    "averagePnL": 7.14
  }
}
```

### **8. Get Active Orders**

```bash
GET /api/orders/active/list
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "uuid": "uuid-123",
      "symbol": "BTCUSDT",
      "side": "BUY",
      "type": "LIMIT",
      "status": "PENDING",
      "quantity": 0.001,
      "price": 45000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### **9. Get Orders by Symbol**

```bash
GET /api/orders/symbol/:symbol
```

### **10. Get Orders by Signal**

```bash
GET /api/orders/signal/:signalId
```

### **11. Bulk Create Orders**

```bash
POST /api/orders/bulk/create
```

**Payload:**

```json
{
  "orders": [
    {
      "exchange": "binance",
      "symbol": "BTCUSDT",
      "side": "BUY",
      "type": "LIMIT",
      "quantity": 0.001,
      "price": 45000
    },
    {
      "exchange": "binance",
      "symbol": "ETHUSDT",
      "side": "BUY",
      "type": "LIMIT",
      "quantity": 0.01,
      "price": 3000
    }
  ],
  "executeImmediately": true,
  "batchId": "batch_123",
  "notes": "Bulk order from RSI signals"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bulk orders created: 2 successful, 0 failed",
  "data": {
    "created": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "uuid": "uuid-123",
        "symbol": "BTCUSDT",
        "status": "PENDING"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "uuid": "uuid-124",
        "symbol": "ETHUSDT",
        "status": "PENDING"
      }
    ],
    "failed": []
  }
}
```

### **12. Bulk Update Orders**

```bash
PATCH /api/orders/bulk/update
```

**Payload:**

```json
{
  "orderIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "priority": "high",
  "notes": "Updated priority for all orders"
}
```

### **13. Bulk Cancel Orders**

```bash
PATCH /api/orders/bulk/cancel
```

**Payload:**

```json
{
  "orderIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "reason": "Market volatility too high",
  "force": false
}
```

### **14. Update Order Execution**

```bash
PATCH /api/orders/:id/execution
```

**Payload:**

```json
{
  "exchangeOrderId": "binance_123456",
  "filledQuantity": 0.001,
  "averagePrice": 44950,
  "fees": 0.45,
  "executionNotes": "Order filled at market price"
}
```

### **15. Calculate Order PnL**

```bash
POST /api/orders/:id/pnl
```

**Payload:**

```json
{
  "currentPrice": 46000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pnl": 10.0,
    "pnlPercentage": 0.22
  }
}
```

## 🎯 Frontend Integration Examples

### **React Hook for Orders**

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Order {
  _id: string;
  uuid: string;
  exchange: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  status: string;
  quantity: number;
  price?: number;
  filledQuantity: number;
  averagePrice: number;
  totalFees: number;
  pnl?: number;
  pnlPercentage?: number;
  createdAt: string;
  filledAt?: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch orders with pagination and filtering
  const fetchOrders = async (options = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(options);
      const response = await api.get(`/orders?${params}`);
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/stats/overview');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Create order
  const createOrder = async (orderData: any) => {
    try {
      const response = await api.post('/orders', orderData);
      setOrders((prev) => [response.data.data, ...prev]);
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: string, reason?: string) => {
    try {
      await api.patch(`/orders/${orderId}/cancel`, { reason });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: 'CANCELED',
                canceledAt: new Date().toISOString(),
              }
            : order,
        ),
      );
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  };

  // Bulk cancel orders
  const bulkCancelOrders = async (orderIds: string[], reason?: string) => {
    try {
      await api.patch('/orders/bulk/cancel', { orderIds, reason });
      setOrders((prev) =>
        prev.map((order) =>
          orderIds.includes(order._id)
            ? {
                ...order,
                status: 'CANCELED',
                canceledAt: new Date().toISOString(),
              }
            : order,
        ),
      );
    } catch (error) {
      console.error('Error bulk canceling orders:', error);
      throw error;
    }
  };

  // Calculate PnL
  const calculatePnL = async (orderId: string, currentPrice: number) => {
    try {
      const response = await api.post(`/orders/${orderId}/pnl`, {
        currentPrice,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                pnl: response.data.data.pnl,
                pnlPercentage: response.data.data.pnlPercentage,
              }
            : order,
        ),
      );
      return response.data.data;
    } catch (error) {
      console.error('Error calculating PnL:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchStats();
    }
  }, [user]);

  return {
    orders,
    stats,
    loading,
    fetchOrders,
    fetchStats,
    createOrder,
    cancelOrder,
    bulkCancelOrders,
    calculatePnL,
  };
};
```

### **Order Management Component**

```typescript
import React, { useState } from 'react';
import { useOrders } from './useOrders';

export const OrderManagement: React.FC = () => {
  const {
    orders,
    stats,
    loading,
    fetchOrders,
    createOrder,
    cancelOrder,
    bulkCancelOrders,
    calculatePnL,
  } = useOrders();

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [newOrder, setNewOrder] = useState({
    exchange: 'binance',
    symbol: '',
    side: 'BUY',
    type: 'LIMIT',
    quantity: 0,
    price: 0,
  });

  const handleCreateOrder = async () => {
    try {
      await createOrder(newOrder);
      setNewOrder({
        exchange: 'binance',
        symbol: '',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 0,
        price: 0,
      });
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId, 'User requested cancellation');
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const handleBulkCancel = async () => {
    try {
      await bulkCancelOrders(selectedOrders, 'Bulk cancellation');
      setSelectedOrders([]);
    } catch (error) {
      console.error('Failed to bulk cancel orders:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['PENDING', 'SUBMITTED', 'NEW', 'PARTIALLY_FILLED'].includes(order.status);
    if (filter === 'filled') return order.status === 'FILLED';
    if (filter === 'canceled') return order.status === 'CANCELED';
    return true;
  });

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="order-management">
      {/* Statistics */}
      <div className="order-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats?.total || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Filled Orders</h3>
          <p>{stats?.byStatus?.FILLED || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total PnL</h3>
          <p className={stats?.totalPnL >= 0 ? 'profit' : 'loss'}>
            ${stats?.totalPnL?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Fees</h3>
          <p>${stats?.totalFees?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Create Order Form */}
      <div className="create-order-form">
        <h3>Create New Order</h3>
        <div className="form-row">
          <select
            value={newOrder.exchange}
            onChange={(e) => setNewOrder({...newOrder, exchange: e.target.value})}
          >
            <option value="binance">Binance</option>
            <option value="upstox">Upstox</option>
            <option value="coindcx">CoinDCX</option>
          </select>
          <input
            type="text"
            placeholder="Symbol (e.g., BTCUSDT)"
            value={newOrder.symbol}
            onChange={(e) => setNewOrder({...newOrder, symbol: e.target.value})}
          />
          <select
            value={newOrder.side}
            onChange={(e) => setNewOrder({...newOrder, side: e.target.value})}
          >
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </div>
        <div className="form-row">
          <select
            value={newOrder.type}
            onChange={(e) => setNewOrder({...newOrder, type: e.target.value})}
          >
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
            <option value="STOP_LOSS">Stop Loss</option>
          </select>
          <input
            type="number"
            placeholder="Quantity"
            value={newOrder.quantity}
            onChange={(e) => setNewOrder({...newOrder, quantity: parseFloat(e.target.value)})}
          />
          <input
            type="number"
            placeholder="Price"
            value={newOrder.price}
            onChange={(e) => setNewOrder({...newOrder, price: parseFloat(e.target.value)})}
          />
        </div>
        <button onClick={handleCreateOrder}>Create Order</button>
      </div>

      {/* Order List */}
      <div className="order-list">
        <div className="order-header">
          <div className="filters">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Orders</option>
              <option value="active">Active Orders</option>
              <option value="filled">Filled Orders</option>
              <option value="canceled">Canceled Orders</option>
            </select>
          </div>
          <div className="bulk-actions">
            {selectedOrders.length > 0 && (
              <button onClick={handleBulkCancel}>
                Cancel {selectedOrders.length} Orders
              </button>
            )}
          </div>
        </div>

        <div className="orders">
          {filteredOrders.map(order => (
            <div key={order._id} className={`order ${order.status.toLowerCase()}`}>
              <input
                type="checkbox"
                checked={selectedOrders.includes(order._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOrders([...selectedOrders, order._id]);
                  } else {
                    setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                  }
                }}
              />

              <div className="order-info">
                <div className="order-main">
                  <span className="symbol">{order.symbol}</span>
                  <span className="side">{order.side}</span>
                  <span className="type">{order.type}</span>
                  <span className="status">{order.status}</span>
                </div>
                <div className="order-details">
                  <span>Qty: {order.quantity}</span>
                  {order.price && <span>Price: ${order.price}</span>}
                  {order.filledQuantity > 0 && (
                    <span>Filled: {order.filledQuantity}</span>
                  )}
                  {order.pnl !== undefined && (
                    <span className={order.pnl >= 0 ? 'profit' : 'loss'}>
                      PnL: ${order.pnl.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="order-meta">
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                  <span>{order.exchange}</span>
                </div>
              </div>

              <div className="order-actions">
                {['PENDING', 'SUBMITTED', 'NEW', 'PARTIALLY_FILLED'].includes(order.status) && (
                  <button onClick={() => handleCancelOrder(order._id)}>
                    Cancel
                  </button>
                )}
                {order.status === 'FILLED' && (
                  <button onClick={() => calculatePnL(order._id, 46000)}>
                    Calculate PnL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 🔧 Testing the Orders API

### **Test Script for Orders**

```javascript
// test-orders-api.js
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

const headers = {
  Authorization: `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json',
};

async function testOrdersAPI() {
  try {
    // 1. Create an order
    console.log('📋 Creating order...');
    const createResponse = await axios.post(
      `${API_BASE_URL}/orders`,
      {
        exchange: 'binance',
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 0.001,
        price: 45000,
        source: 'manual',
        priority: 'medium',
        notes: 'Test order from API',
        tags: ['test', 'api'],
      },
      { headers },
    );

    const orderId = createResponse.data.data._id;
    console.log('✅ Order created:', orderId);

    // 2. Get orders
    console.log('📋 Fetching orders...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, {
      headers,
    });
    console.log(`Found ${ordersResponse.data.data.orders.length} orders`);

    // 3. Get order by ID
    console.log('📋 Fetching order by ID...');
    const orderResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers,
    });
    console.log('Order details:', orderResponse.data.data.symbol);

    // 4. Get order statistics
    console.log('📊 Fetching order statistics...');
    const statsResponse = await axios.get(
      `${API_BASE_URL}/orders/stats/overview`,
      { headers },
    );
    console.log('Order stats:', statsResponse.data.data);

    // 5. Get active orders
    console.log('📋 Fetching active orders...');
    const activeResponse = await axios.get(
      `${API_BASE_URL}/orders/active/list`,
      { headers },
    );
    console.log(`Found ${activeResponse.data.data.length} active orders`);

    // 6. Update order
    console.log('✏️ Updating order...');
    const updateResponse = await axios.put(
      `${API_BASE_URL}/orders/${orderId}`,
      {
        priority: 'high',
        notes: 'Updated test order',
      },
      { headers },
    );
    console.log('✅ Order updated');

    // 7. Cancel order
    console.log('❌ Canceling order...');
    const cancelResponse = await axios.patch(
      `${API_BASE_URL}/orders/${orderId}/cancel`,
      {
        reason: 'Test cancellation',
      },
      { headers },
    );
    console.log('✅ Order canceled');

    // 8. Bulk create orders
    console.log('📋 Creating bulk orders...');
    const bulkResponse = await axios.post(
      `${API_BASE_URL}/orders/bulk/create`,
      {
        orders: [
          {
            exchange: 'binance',
            symbol: 'ETHUSDT',
            side: 'BUY',
            type: 'LIMIT',
            quantity: 0.01,
            price: 3000,
          },
          {
            exchange: 'binance',
            symbol: 'ADAUSDT',
            side: 'SELL',
            type: 'MARKET',
            quantity: 100,
          },
        ],
        batchId: 'test_batch_123',
        notes: 'Bulk test orders',
      },
      { headers },
    );
    console.log(
      '✅ Bulk orders created:',
      bulkResponse.data.data.created.length,
    );
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testOrdersAPI();
```

## 🎉 Key Benefits

✅ **Multi-Exchange Support**: Works with Binance, Upstox, CoinDCX, and manual trading
✅ **Comprehensive Order Types**: Market, Limit, Stop Loss, Take Profit, OCO, Trailing Stop
✅ **Order Lifecycle Management**: Complete order status tracking and transitions
✅ **Bulk Operations**: Efficiently manage multiple orders at once
✅ **Risk Management**: Built-in position sizing, stop loss, and take profit
✅ **Performance Tracking**: Real-time PnL calculation and statistics
✅ **Audit Trail**: Complete history of order changes and events
✅ **Retry Mechanism**: Automatic retry for failed orders with exponential backoff
✅ **Advanced Filtering**: Filter orders by exchange, symbol, status, type, and more
✅ **Event-Driven**: Emits events for order lifecycle changes
✅ **Paper Trading**: Support for paper trading and backtesting
✅ **Webhook Integration**: Ready for exchange webhook callbacks
✅ **Performance Optimized**: MongoDB indexes for fast queries

This comprehensive order management system provides everything you need for professional trading operations!
