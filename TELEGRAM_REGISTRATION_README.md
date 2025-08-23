# 🚀 Telegram-Initiated Registration Flow

This project now implements a **seamless registration flow** where users start the registration process through Telegram and complete it on a web page.

## 🔄 **How It Works**

### **Step 1: User Starts Bot**

```
User sends /start to Telegram bot
↓
Bot captures telegramId, username, chatId
↓
Bot generates secure registration token
↓
Bot sends registration link to user
```

### **Step 2: User Completes Registration**

```
User clicks registration link
↓
Web page validates token
↓
User enters username & password
↓
Account created and linked to Telegram
```

## 📱 **Bot Commands**

- **`/start`** - Begin registration process
- **`/help`** - Show available commands
- **`/subscribe`** - Subscribe to crypto signals (after registration)
- **`/unsubscribe`** - Unsubscribe from signals

## 🌐 **API Endpoints**

### **Registration Flow**

- `POST /api/auth/complete-registration/:token` - Complete registration with token
- `GET /api/auth/validate-registration-token/:token` - Validate registration token

### **Standard Auth**

- `POST /api/auth/register` - Direct registration (with telegramId)
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

## 🔐 **Security Features**

- **Time-limited tokens** - Registration tokens expire in 1 hour
- **Token validation** - Each token is verified before use
- **Duplicate prevention** - Users can't register multiple accounts
- **Secure linking** - Telegram account securely linked to web account

## 🛠 **Environment Variables**

```env
# Bot Configuration
BOT_TOKEN=your_telegram_bot_token

# Frontend URL (for registration links)
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

## 📁 **Files Created/Modified**

### **New Files**

- `src/modules/auth/registration-token.service.ts` - Token management
- `src/modules/auth/dto/complete-registration.dto.ts` - Registration DTO
- `public/register.html` - Registration web page
- `src/bot/bot.service.ts` - Enhanced bot service

### **Modified Files**

- `src/modules/auth/auth.service.ts` - Added token-based registration
- `src/modules/auth/auth.controller.ts` - New endpoints
- `src/modules/auth/auth.module.ts` - Added dependencies
- `src/bot/bot.module.ts` - Imported auth services
- `src/main.ts` - Bot startup

## 🚀 **Getting Started**

### **1. Install Dependencies**

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcryptjs @types/passport-jwt @types/passport-local @types/bcryptjs
```

### **2. Set Environment Variables**

```env
BOT_TOKEN=your_telegram_bot_token
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

### **3. Start the Application**

```bash
npm run start:dev
```

### **4. Test the Flow**

1. Start your Telegram bot with `/start`
2. Click the registration link
3. Complete registration on web page
4. Return to bot and use `/subscribe`

## 🔍 **Testing the Registration Flow**

### **Bot Interaction**

```
User: /start
Bot: Welcome! Visit: http://localhost:3000/register?token=abc123...
```

### **Web Registration**

```
1. User visits registration link
2. Page validates token
3. User enters username/password
4. Account created and linked
5. Success message displayed
```

### **API Testing**

```bash
# Validate token
curl http://localhost:3000/api/auth/validate-registration-token/abc123

# Complete registration
curl -X POST http://localhost:3000/api/auth/complete-registration/abc123 \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 🎯 **Benefits of This Approach**

✅ **Seamless UX** - Users don't need to know their telegramId  
✅ **Secure** - Tokens expire and are validated  
✅ **User-friendly** - Clear step-by-step process  
✅ **Integrated** - Bot and web seamlessly connected  
✅ **Scalable** - Easy to extend with additional features

## 🔮 **Future Enhancements**

- **Email verification** - Add email confirmation step
- **Profile completion** - Additional user preferences
- **Subscription management** - Web-based subscription control
- **Notification preferences** - Customize alert settings
- **Multi-language support** - Internationalization

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Bot not starting** - Check BOT_TOKEN environment variable
2. **Registration link not working** - Verify FRONTEND_URL setting
3. **Token expired** - Get new token with /start command
4. **Username taken** - Choose different username

### **Debug Mode**

Enable debug logging in your bot service to see detailed information about the registration process.

---

**This registration flow provides a modern, secure, and user-friendly way to onboard users from Telegram to your web application! 🎉**
