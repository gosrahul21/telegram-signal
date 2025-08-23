# JWT Authentication Setup

This project now includes a complete JWT authentication system. Here's what you need to do to get it working:

## 1. Install Dependencies

First, install the required packages:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcryptjs @types/passport-jwt @types/passport-local @types/bcryptjs
```

## 2. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/telegram-signal
```

## 3. Features Implemented

### Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/login-local` - Local strategy login
- `GET /auth/profile` - Get user profile (protected)

### Guards

- `JwtAuthGuard` - Protects routes requiring JWT authentication
- `LocalAuthGuard` - Handles username/password authentication

### Strategies

- `JwtStrategy` - Validates JWT tokens
- `LocalStrategy` - Validates username/password

## 4. Usage Examples

### Protecting Routes

```typescript
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alerts')
export class AlertController {
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertService.create(createAlertDto);
  }
}
```

### Getting User from Request

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user; // Contains user info from JWT token
}
```

## 5. User Model Updates

The user model now includes:

- `username` (unique)
- `password` (hashed with bcrypt)
- `telegramId` (unique)
- `chatId` (unique)

## 6. Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 24 hours (configurable)
- Protected routes require valid JWT tokens
- User validation on every request

## 7. Testing the Authentication

### Register a new user:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "telegramId": 123456789,
    "chatId": 987654321
  }'
```

### Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Access protected route:

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 8. Integration with Existing Code

The authentication system is already integrated with:

- Alert controller (protected routes)
- User management
- Database models

All existing functionality remains intact, with added security through JWT authentication.
