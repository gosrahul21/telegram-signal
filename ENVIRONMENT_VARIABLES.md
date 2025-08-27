# 🌍 Environment Variables Configuration

This document lists all the required environment variables for the Telegram Signal application.

## 📋 **Required Environment Variables**

Create a `.env` file in your project root with the following variables:

### **🔧 Application Configuration**

```env
NODE_ENV=development
PORT=3000
```

### **🗄️ Database Configuration**

```env
MONGODB_URL_PROD=mongodb://localhost:27017/telegram-signal
```

### **🔐 JWT Authentication**

```env
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=24h
```

### **🤖 Telegram Bot Configuration**

```env
BOT_TOKEN=your_telegram_bot_token_here
```

### **🌐 Frontend Configuration**

```env
FRONTEND_URL=http://localhost:3000
```

### **💱 Exchange API Credentials**

```env
# CoinDCX API (for Indian crypto trading)
COINDCX_API_KEY=your_coindcx_api_key_here
COINDCX_SECRET_KEY=your_coindcx_secret_key_here
```

### **📊 Technical Analysis Configuration**

```env
# RSI Thresholds
RSI_OVERBOUGHT_THRESHOLD=70
RSI_OVERSOLD_THRESHOLD=30
RSI_EXTREME_OVERBOUGHT=80
RSI_EXTREME_OVERSOLD=20
```

### **⏱️ Monitoring Configuration**

```env
# Delay between checking different trading pairs (in milliseconds)
DELAY_BETWEEN_PAIRS_MS=1000
```

### **🔌 Socket Configuration**

```env
# WebSocket settings
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### **📝 Logging Configuration**

```env
LOG_LEVEL=debug
```

### **🛡️ Security Configuration**

```env
# CORS settings
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

## 🚀 **Complete .env File Example**

```env
# ========================================
# APPLICATION CONFIGURATION
# ========================================
NODE_ENV=development
PORT=3000

# ========================================
# DATABASE CONFIGURATION
# ========================================
MONGODB_URL_PROD=mongodb://localhost:27017/telegram-signal

# ========================================
# JWT AUTHENTICATION
# ========================================
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=24h

# ========================================
# TELEGRAM BOT CONFIGURATION
# ========================================
BOT_TOKEN=your_telegram_bot_token_here

# ========================================
# FRONTEND CONFIGURATION
# ========================================
FRONTEND_URL=http://localhost:3000

# ========================================
# EXCHANGE API CREDENTIALS
# ========================================
# CoinDCX API (for Indian crypto trading)
COINDCX_API_KEY=your_coindcx_api_key_here
COINDCX_SECRET_KEY=your_coindcx_secret_key_here

# ========================================
# TECHNICAL ANALYSIS CONFIGURATION
# ========================================
# RSI Thresholds
RSI_OVERBOUGHT_THRESHOLD=70
RSI_OVERSOLD_THRESHOLD=30
RSI_EXTREME_OVERBOUGHT=80
RSI_EXTREME_OVERSOLD=20

# ========================================
# MONITORING CONFIGURATION
# ========================================
# Delay between checking different trading pairs (in milliseconds)
DELAY_BETWEEN_PAIRS_MS=1000

# ========================================
# SOCKET CONFIGURATION
# ========================================
# WebSocket settings
SOCKET_CORS_ORIGIN=http://localhost:3000

# ========================================
# LOGGING CONFIGURATION
# ========================================
LOG_LEVEL=debug

# ========================================
# SECURITY CONFIGURATION
# ========================================
# CORS settings
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

## 🏭 **Production Configuration**

For production, update these variables:

```env
NODE_ENV=production
PORT=8080
MONGODB_URL_PROD=mongodb://production-mongo:27017/telegram-signal
JWT_SECRET=your-production-jwt-secret-here
BOT_TOKEN=your_production_bot_token
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
SOCKET_CORS_ORIGIN=https://yourdomain.com
```

## 🔍 **Where These Variables Are Used**

### **Database Connection**

- `MONGODB_URL_PROD` - Used in `app.module.ts` and `connection.ts`

### **JWT Authentication**

- `JWT_SECRET` - Used in JWT strategy, auth module, and socket middleware
- `JWT_EXPIRES_IN` - Used in auth module for token expiration

### **Telegram Bot**

- `BOT_TOKEN` - Used in `bot.ts` and `bot.service.ts`

### **Frontend Integration**

- `FRONTEND_URL` - Used in bot service for registration links

### **Exchange APIs**

- `COINDCX_API_KEY` - Used in CoinDCX service
- `COINDCX_SECRET_KEY` - Used in CoinDCX service

### **Technical Analysis**

- RSI thresholds are used in the monitoring service
- `DELAY_BETWEEN_PAIRS_MS` - Used in configuration for monitoring delays

### **Server Configuration**

- `PORT` - Used in `main.ts` for server port
- `NODE_ENV` - Used for environment-specific behavior

## ⚠️ **Security Notes**

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for JWT_SECRET in production
3. **Rotate API keys** regularly
4. **Use environment-specific values** for different deployment environments
5. **Validate all environment variables** on application startup

## 🚀 **Getting Started**

1. Copy the example `.env` file above
2. Fill in your actual values for each variable
3. Restart your application
4. Verify all services are working correctly

## 🔧 **Validation**

The application will validate required environment variables on startup. Missing critical variables will cause the application to fail with clear error messages.
