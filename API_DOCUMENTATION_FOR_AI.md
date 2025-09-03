# Complete API Documentation for AI Frontend Integration

## Base Configuration

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
const WEBSOCKET_URL = 'ws://localhost:3000';

// Authentication
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});
```

## 1. Authentication APIs

### 1.1 User Login

```typescript
// POST /api/auth/login
const loginPayload = {
  username: 'john_doe',
  password: 'password123',
};

const loginResponse = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  user: {
    id: '507f1f77bcf86cd799439011',
    username: 'john_doe',
    telegramId: 123456789,
    chatId: 123456789,
    isVerified: true,
  },
};
```

### 1.2 User Registration

```typescript
// POST /api/auth/register
const registerPayload = {
  username: 'new_user',
  password: 'password123',
};

const registerResponse = {
  success: true,
  message: 'User registered successfully',
  user: {
    id: '507f1f77bcf86cd799439011',
    username: 'new_user',
    telegramId: 123456789,
    chatId: 123456789,
  },
};
```

### 1.3 Complete Registration with Token

```typescript
// POST /api/auth/complete-registration/:token
const completeRegistrationPayload = {
  username: 'john_doe',
  password: 'password123',
};

const completeRegistrationResponse = {
  success: true,
  message: 'Registration completed successfully',
  user: {
    id: '507f1f77bcf86cd799439011',
    username: 'john_doe',
    telegramId: 123456789,
    chatId: 123456789,
  },
};
```

### 1.4 Link Telegram Account

```typescript
// POST /api/auth/link-telegram
const linkTelegramPayload = {
  linkToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

const linkTelegramResponse = {
  success: true,
  message: 'Telegram account linked successfully',
  user: {
    id: '507f1f77bcf86cd799439011',
    username: 'john_doe',
    telegramId: 123456789,
    chatId: 123456789,
    isVerified: true,
  },
};
```

### 1.5 Get User Profile

```typescript
// GET /api/auth/profile
const profileResponse = {
  id: '507f1f77bcf86cd799439011',
  username: 'john_doe',
  telegramId: 123456789,
  chatId: 123456789,
  isVerified: true,
  lastLogin: '2024-01-01T00:00:00.000Z',
};
```

### 1.6 Local Authentication Login

```typescript
// POST /api/auth/login-local
const localLoginPayload = {
  username: 'john_doe',
  password: 'password123',
};

const localLoginResponse = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  user: {
    id: '507f1f77bcf86cd799439011',
    username: 'john_doe',
  },
};
```

## 2. User Management APIs

### 2.1 Create User

```typescript
// POST /api/users
const createUserPayload = {
  username: 'new_user',
  password: 'password123',
};

const createUserResponse = {
  _id: '507f1f77bcf86cd799439011',
  username: 'new_user',
  telegramId: 123456789,
  chatId: 123456789,
  isVerified: false,
  lastLogin: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
```

### 2.2 Get All Users

```typescript
// GET /api/users
const getAllUsersResponse = [
  {
    _id: '507f1f77bcf86cd799439011',
    username: 'john_doe',
    telegramId: 123456789,
    chatId: 123456789,
    isVerified: true,
    lastLogin: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '507f1f77bcf86cd799439012',
    username: 'jane_doe',
    telegramId: 987654321,
    chatId: 987654321,
    isVerified: false,
    lastLogin: '2024-01-01T00:00:00.000Z',
  },
];
```

### 2.3 Get User Profile

```typescript
// GET /api/users/profile
const getUserProfileResponse = {
  _id: '507f1f77bcf86cd799439011',
  username: 'john_doe',
  telegramId: 123456789,
  chatId: 123456789,
  isVerified: true,
  lastLogin: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
```

### 2.4 Get User by ID

```typescript
// GET /api/users/:id
const getUserByIdResponse = {
  _id: '507f1f77bcf86cd799439011',
  username: 'john_doe',
  telegramId: 123456789,
  chatId: 123456789,
  isVerified: true,
  lastLogin: '2024-01-01T00:00:00.000Z',
};
```

### 2.5 Update User

```typescript
// PATCH /api/users/:id
const updateUserPayload = {
  username: 'new_username',
  password: 'newpassword123',
  isVerified: true,
};

const updateUserResponse = {
  _id: '507f1f77bcf86cd799439011',
  username: 'new_username',
  telegramId: 123456789,
  chatId: 123456789,
  isVerified: true,
  lastLogin: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
```

### 2.6 Delete User

```typescript
// DELETE /api/users/:id
const deleteUserResponse = {
  message: 'User deleted successfully',
};
```

### 2.7 Verify User

```typescript
// PATCH /api/users/:id/verify
const verifyUserResponse = {
  _id: '507f1f77bcf86cd799439011',
  username: 'john_doe',
  telegramId: 123456789,
  chatId: 123456789,
  isVerified: true,
  lastLogin: '2024-01-01T00:00:00.000Z',
};
```

## 3. Alert Management APIs

### 3.1 Create Alert

```typescript
// POST /api/alerts
const createAlertPayload = {
  symbol: 'BTCUSDT',
  type: 'RSI_OVERBOUGHT',
  count: 5,
  infinite: false,
  timeframe: '1h',
  conditions: {
    rsi: 70,
    volume: 1000000,
  },
  description: 'RSI overbought alert for BTC',
  tags: ['crypto', 'rsi', 'btc'],
  metadata: {
    priority: 'high',
    category: 'technical',
  },
};

const createAlertResponse = {
  _id: '507f1f77bcf86cd799439011',
  symbol: 'BTCUSDT',
  userId: '507f1f77bcf86cd799439011',
  type: 'RSI_OVERBOUGHT',
  count: 5,
  infinite: false,
  timeframe: '1h',
  conditions: {
    rsi: 70,
    volume: 1000000,
  },
  description: 'RSI overbought alert for BTC',
  tags: ['crypto', 'rsi', 'btc'],
  metadata: {
    priority: 'high',
    category: 'technical',
  },
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
```

### 3.2 Get All Alerts

```typescript
// GET /api/alerts
const getAllAlertsResponse = [
  {
    _id: '507f1f77bcf86cd799439011',
    symbol: 'BTCUSDT',
    userId: '507f1f77bcf86cd799439011',
    type: 'RSI_OVERBOUGHT',
    count: 5,
    infinite: false,
    timeframe: '1h',
    conditions: {
      rsi: 70,
      volume: 1000000,
    },
    description: 'RSI overbought alert for BTC',
    tags: ['crypto', 'rsi', 'btc'],
    metadata: {
      priority: 'high',
      category: 'technical',
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];
```

### 3.3 Get Active Alerts

```typescript
// GET /api/alerts/active
const getActiveAlertsResponse = [
  {
    _id: '507f1f77bcf86cd799439011',
    symbol: 'BTCUSDT',
    userId: '507f1f77bcf86cd799439011',
    type: 'RSI_OVERBOUGHT',
    count: 5,
    infinite: false,
    timeframe: '1h',
    conditions: {
      rsi: 70,
      volume: 1000000,
    },
    description: 'RSI overbought alert for BTC',
    tags: ['crypto', 'rsi', 'btc'],
    metadata: {
      priority: 'high',
      category: 'technical',
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];
```

### 3.4 Get Alerts by Symbol

```typescript
// GET /api/alerts/symbol/:symbol
const getAlertsBySymbolResponse = [
  {
    _id: '507f1f77bcf86cd799439011',
    symbol: 'BTCUSDT',
    userId: '507f1f77bcf86cd799439011',
    type: 'RSI_OVERBOUGHT',
    count: 5,
    infinite: false,
    timeframe: '1h',
    conditions: {
      rsi: 70,
      volume: 1000000,
    },
    description: 'RSI overbought alert for BTC',
    tags: ['crypto', 'rsi', 'btc'],
    metadata: {
      priority: 'high',
      category: 'technical',
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];
```

### 3.5 Get Alerts by User ID

```typescript
// GET /api/alerts/user/:userId
const getAlertsByUserIdResponse = [
  {
    _id: '507f1f77bcf86cd799439011',
    symbol: 'BTCUSDT',
    userId: '507f1f77bcf86cd799439011',
    type: 'RSI_OVERBOUGHT',
    count: 5,
    infinite: false,
    timeframe: '1h',
    conditions: {
      rsi: 70,
      volume: 1000000,
    },
    description: 'RSI overbought alert for BTC',
    tags: ['crypto', 'rsi', 'btc'],
    metadata: {
      priority: 'high',
      category: 'technical',
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];
```

### 3.6 Get Alert by ID

```typescript
// GET /api/alerts/:id
const getAlertByIdResponse = {
  _id: '507f1f77bcf86cd799439011',
  symbol: 'BTCUSDT',
  userId: '507f1f77bcf86cd799439011',
  type: 'RSI_OVERBOUGHT',
  count: 5,
  infinite: false,
  timeframe: '1h',
  conditions: {
    rsi: 70,
    volume: 1000000,
  },
  description: 'RSI overbought alert for BTC',
  tags: ['crypto', 'rsi', 'btc'],
  metadata: {
    priority: 'high',
    category: 'technical',
  },
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
```

### 3.7 Update Alert

```typescript
// PATCH /api/alerts/:id
const updateAlertPayload = {
  symbol: 'ETHUSDT',
  type: 'RSI_OVERSOLD',
  count: 10,
  infinite: true,
  timeframe: '4h',
  conditions: {
    rsi: 30,
    volume: 2000000,
  },
  description: 'RSI oversold alert for ETH',
  tags: ['crypto', 'rsi', 'eth'],
  metadata: {
    priority: 'medium',
    category: 'technical',
  },
};

const updateAlertResponse = {
  _id: '507f1f77bcf86cd799439011',
  symbol: 'ETHUSDT',
  userId: '507f1f77bcf86cd799439011',
  type: 'RSI_OVERSOLD',
  count: 10,
  infinite: true,
  timeframe: '4h',
  conditions: {
    rsi: 30,
    volume: 2000000,
  },
  description: 'RSI oversold alert for ETH',
  tags: ['crypto', 'rsi', 'eth'],
  metadata: {
    priority: 'medium',
    category: 'technical',
  },
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
```

### 3.8 Delete Alert

```typescript
// DELETE /api/alerts/:id
const deleteAlertResponse = {
  message: 'Alert deleted successfully',
};
```

## 4. Monitoring APIs

### 4.1 Get RSI Status

```typescript
// GET /api/monitor/rsi
const getRsiStatusResponse = {
  status: 'active',
  lastUpdate: '2024-01-01T00:00:00.000Z',
  symbols: ['BTCUSDT', 'ETHUSDT'],
  data: {
    BTCUSDT: {
      rsi: 65.5,
      timeframe: '1h',
      status: 'neutral',
    },
    ETHUSDT: {
      rsi: 45.2,
      timeframe: '1h',
      status: 'neutral',
    },
  },
};
```

### 4.2 Get Bollinger Bands Status

```typescript
// GET /api/monitor/bollinger-bands
const getBollingerBandsStatusResponse = {
  status: 'active',
  lastUpdate: '2024-01-01T00:00:00.000Z',
  symbols: ['BTCUSDT', 'ETHUSDT'],
  data: {
    BTCUSDT: {
      upper: 45000,
      middle: 43000,
      lower: 41000,
      price: 43500,
      status: 'neutral',
    },
    ETHUSDT: {
      upper: 3200,
      middle: 3000,
      lower: 2800,
      price: 3050,
      status: 'neutral',
    },
  },
};
```

### 4.3 Get MACD Status

```typescript
// GET /api/monitor/macd
const getMacdStatusResponse = {
  status: 'active',
  lastUpdate: '2024-01-01T00:00:00.000Z',
  symbols: ['BTCUSDT', 'ETHUSDT'],
  data: {
    BTCUSDT: {
      macd: 150.5,
      signal: 140.2,
      histogram: 10.3,
      status: 'bullish',
    },
    ETHUSDT: {
      macd: -25.8,
      signal: -20.1,
      histogram: -5.7,
      status: 'bearish',
    },
  },
};
```

## 5. Health Check APIs

### 5.1 Get Health Status

```typescript
// GET /api/health
const getHealthResponse = {
  status: 'ok',
  timestamp: '2024-01-01T00:00:00.000Z',
  uptime: 3600,
  services: {
    database: 'connected',
    websocket: 'active',
    monitoring: 'running',
  },
};
```

### 5.2 Keep Alive

```typescript
// GET /api/health/keep-alive
const keepAliveResponse = {
  status: 'alive',
  timestamp: '2024-01-01T00:00:00.000Z',
};
```

## 6. WebSocket Events

### 6.1 Connection Events

```typescript
// WebSocket Connection
const socket = io(WEBSOCKET_URL, {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
});

// Connection Events
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connected', (data) => {
  console.log('Server confirmation:', data);
  // Response: {
  //   message: "Successfully connected to monitoring service",
  //   userId: "507f1f77bcf86cd799439011",
  //   timestamp: "2024-01-01T00:00:00.000Z"
  // }
});
```

### 6.2 Client to Server Events

```typescript
// Send Test Alert
```

### 6.3 Server to Client Events

```typescript
// Connection Info Response
socket.on('connection_info', (data) => {
  console.log('Connection info:', data);
  // Response: {
  //   userId: "507f1f77bcf86cd799439011",
  //   connectionId: "socket_id_123",
  //   connected: true,
  //   totalConnections: 5,
  //   timestamp: "2024-01-01T00:00:00.000Z"
  // }
});

// Active Alerts Response
socket.on('active_alerts', (data) => {
  console.log('Active alerts:', data);
  // Response: {
  //   userId: "507f1f77bcf86cd799439011",
  //   alerts: [...],
  //   count: 3,
  //   timestamp: "2024-01-01T00:00:00.000Z",
  //   message: "Active alerts retrieved successfully"
  // }
});

// Monitoring Summary Response
socket.on('monitoring_summary', (data) => {
  console.log('Monitoring summary:', data);
  // Response: {
  //   userId: "507f1f77bcf86cd799439011",
  //   totalAlerts: 10,
  //   activeAlerts: 3,
  //   monitoringSymbols: ["BTCUSDT", "ETHUSDT"],
  //   lastUpdate: "2024-01-01T00:00:00.000Z",
  //   status: "active",
  //   message: "Monitoring summary retrieved successfully"
  // }
});

// Test Alert Response
socket.on('test_alert', (data) => {
  console.log('Test alert:', data);
  // Response: {
  //   type: "test_alert",
  //   data: {
  //     alertId: "test_1234567890",
  //     symbol: "BTCUSDT",
  //     eventType: "price_alert",
  //     message: "This is a test alert",
  //     timestamp: "2024-01-01T00:00:00.000Z"
  //   },
  //   message: "Test alert sent successfully"
  // }
});

// Heartbeat Response
socket.on('heartbeat_response', (data) => {
  console.log('Heartbeat response:', data);
  // Response: {
  //   type: "heartbeat_response",
  //   data: {
  //     userId: "507f1f77bcf86cd799439011",
  //     timestamp: "2024-01-01T00:00:00.000Z",
  //     serverTime: 1704067200000
  //   },
  //   message: "Heartbeat received"
  // }
});

// Real-time Notifications
socket.on('notification', (data) => {
  console.log('Notification:', data);
  // Response: {
  //   type: "alert_triggered",
  //   data: {
  //     alertId: "507f1f77bcf86cd799439011",
  //     symbol: "BTCUSDT",
  //     message: "RSI overbought alert triggered",
  //     timestamp: "2024-01-01T00:00:00.000Z"
  //   }
  // }
});

// Order Updates
socket.on('order_update', (data) => {
  console.log('Order update:', data);
  // Response: {
  //   type: "order_status_change",
  //   data: {
  //     orderId: "507f1f77bcf86cd799439011",
  //     status: "filled",
  //     symbol: "BTCUSDT",
  //     timestamp: "2024-01-01T00:00:00.000Z"
  //   }
  // }
});
```

## 7. Error Responses

### 7.1 Authentication Errors

```typescript
// 401 Unauthorized
const authErrorResponse = {
  statusCode: 401,
  message: 'Unauthorized',
  error: 'Unauthorized',
};

// 400 Bad Request
const badRequestResponse = {
  statusCode: 400,
  message: 'Invalid credentials',
  error: 'Bad Request',
};
```

### 7.2 Validation Errors

```typescript
// 400 Validation Error
const validationErrorResponse = {
  statusCode: 400,
  message: [
    'username should not be empty',
    'password must be longer than or equal to 6 characters',
  ],
  error: 'Bad Request',
};
```

### 7.3 Not Found Errors

```typescript
// 404 Not Found
const notFoundResponse = {
  statusCode: 404,
  message: 'User not found',
  error: 'Not Found',
};
```

## 8. TypeScript Interfaces

```typescript
// User Interface
interface User {
  id: string;
  username: string;
  telegramId?: number;
  chatId?: number;
  isVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Alert Interface
interface Alert {
  _id: string;
  symbol: string;
  userId: string;
  type: MonitorEventType;
  count: number;
  infinite: boolean;
  timeframe: Timeframe;
  conditions?: Record<string, any>;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Monitor Event Types
enum MonitorEventType {
  RSI_OVERBOUGHT = 'RSI_OVERBOUGHT',
  RSI_OVERSOLD = 'RSI_OVERSOLD',
  BOLLINGER_UPPER = 'BOLLINGER_UPPER',
  BOLLINGER_LOWER = 'BOLLINGER_LOWER',
  MACD_BULLISH = 'MACD_BULLISH',
  MACD_BEARISH = 'MACD_BEARISH',
  PRICE_ABOVE = 'PRICE_ABOVE',
  PRICE_BELOW = 'PRICE_BELOW',
}

// Timeframe Types
enum Timeframe {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
}

// WebSocket Message Interface
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  message?: string;
}
```

## 9. Frontend Integration Examples

### 9.1 Axios Configuration

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

### 9.2 React Hook Examples

```typescript
// useAuth hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user } = response.data;
      localStorage.setItem('jwt', access_token);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
  };

  return { user, login, logout, loading };
};

// useAlerts hook
export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const createAlert = async (alertData: CreateAlertDto) => {
    setLoading(true);
    try {
      const response = await api.post('/alerts', alertData);
      setAlerts((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/alerts');
      setAlerts(response.data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { alerts, createAlert, fetchAlerts, loading };
};
```

## 10. Environment Variables

```bash
# Frontend (.env)
VITE_BACKEND_URI=http://localhost:3000
VITE_WEBSOCKET_URI=ws://localhost:3000

# Backend (.env)
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
MONGODB_URI=mongodb://localhost:27017/telegram-signal
```

This comprehensive API documentation provides all the necessary information for AI to automatically integrate the frontend with your backend services.
