# 📚 Swagger API Documentation

This project includes comprehensive Swagger/OpenAPI documentation for all API endpoints. The documentation provides interactive API testing, detailed request/response schemas, and authentication information.

## 🚀 **Quick Start**

### **1. Install Dependencies**

```bash
npm install @nestjs/swagger swagger-ui-express
```

### **2. Access Documentation**

Once the application is running, access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## 📖 **Documentation Features**

### **Interactive API Testing**

- **Try It Out** - Test endpoints directly from the browser
- **Request Builder** - Build requests with proper validation
- **Response Examples** - See expected response formats
- **Authentication** - JWT token management for protected endpoints

### **Comprehensive Coverage**

- **All Endpoints** - Complete API coverage with detailed descriptions
- **Request/Response Schemas** - Full data structure documentation
- **Error Responses** - Detailed error code documentation
- **Authentication** - Bearer token setup and usage

## 🔐 **Authentication Setup**

### **JWT Bearer Token**

1. **Get Token**: Use the `/api/auth/login` endpoint
2. **Set Token**: Click the "Authorize" button in Swagger UI
3. **Enter Token**: Use format: `Bearer <your_jwt_token>`
4. **Test Protected Endpoints**: All authenticated endpoints will now work

### **Token Format**

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 **API Endpoints Documentation**

### **🔐 Authentication (`/api/auth`)**

#### **POST /api/auth/login**

- **Description**: User login with username and password
- **Request Body**: `LoginDto` with username and password
- **Response**: JWT token and user information
- **Authentication**: Not required

#### **POST /api/auth/register**

- **Description**: Create new user account
- **Request Body**: `RegisterDto` with user details
- **Response**: Success message and user information
- **Authentication**: Not required

#### **POST /api/auth/generate-registration-token**

- **Description**: Generate a new registration token for linking Telegram account
- **Request Body**: `GenerateRegistrationTokenDto` with optional reason and expiration
- **Response**: Registration token, URL, and instructions
- **Authentication**: JWT Bearer token required

#### **POST /api/auth/link-telegram**

- **Description**: Link Telegram account to existing user
- **Request Body**: `LinkTelegramDto` with link token
- **Response**: Success message and updated user info
- **Authentication**: JWT Bearer token required

#### **POST /api/auth/complete-registration/:token**

- **Description**: Complete registration with token
- **Path Parameter**: Registration token
- **Request Body**: `CompleteRegistrationDto` with username and password
- **Response**: Success message and user information
- **Authentication**: Not required

#### **GET /api/auth/profile**

- **Description**: Get current user profile
- **Response**: User profile information
- **Authentication**: JWT Bearer token required

#### **POST /api/auth/login-local**

- **Description**: Alternative login method
- **Response**: JWT token and user information
- **Authentication**: Not required

### **👥 Users (`/api/users`)**

#### **POST /api/users**

- **Description**: Create new user account
- **Request Body**: `CreateUserDto` with username and password
- **Response**: Created user information
- **Authentication**: JWT Bearer token required

#### **GET /api/users**

- **Description**: Get all users (admin only)
- **Response**: Array of user objects
- **Authentication**: JWT Bearer token required

#### **GET /api/users/profile**

- **Description**: Get current user profile
- **Response**: Current user information
- **Authentication**: JWT Bearer token required

#### **GET /api/users/:id**

- **Description**: Get user by ID
- **Path Parameter**: User ID
- **Response**: User information
- **Authentication**: JWT Bearer token required

#### **PATCH /api/users/:id**

- **Description**: Update user information
- **Path Parameter**: User ID
- **Request Body**: User update data
- **Response**: Updated user information
- **Authentication**: JWT Bearer token required

#### **DELETE /api/users/:id**

- **Description**: Delete user account
- **Path Parameter**: User ID
- **Response**: Success message
- **Authentication**: JWT Bearer token required

#### **PATCH /api/users/:id/verify**

- **Description**: Verify user account
- **Path Parameter**: User ID
- **Response**: Verified user information
- **Authentication**: JWT Bearer token required

## 📊 **Data Transfer Objects (DTOs)**

### **LoginDto**

```typescript
{
  username: string; // Username for authentication
  password: string; // Password for authentication
}
```

### **RegisterDto**

```typescript
{
  username: string; // Username for new account
  password: string; // Password for new account
  telegramId: number; // Telegram user ID
  chatId: number; // Telegram chat ID
}
```

### **CompleteRegistrationDto**

```typescript
{
  username: string; // Username for new account
  password: string; // Password for new account
}
```

### **CreateUserDto**

```typescript
{
  username: string; // Username for new account
  password: string; // Password for new account
}
```

### **GenerateRegistrationTokenDto**

```typescript
{
  reason?: string;     // Optional reason for generating token
  expiresIn?: string;  // Optional custom expiration (30m, 1h, 2h, 4h, 1d)
}
```

### **LinkTelegramDto**

```typescript
{
  linkToken: string; // Registration token from Telegram bot
}
```

## 🔧 **Configuration**

### **Swagger Setup**

The Swagger configuration is in `src/swagger.config.ts`:

```typescript
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Telegram Signal Bot API')
    .setDescription('Comprehensive API for crypto signal subscriptions')
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addBearerAuth('JWT-auth')
    .build();

  // ... configuration details
}
```

### **Main Application**

Swagger is initialized in `src/main.ts`:

```typescript
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger documentation
  setupSwagger(app);

  // ... rest of configuration
}
```

## 🎨 **Customization**

### **UI Customization**

The Swagger UI can be customized in the configuration:

```typescript
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true, // Keep auth between requests
    docExpansion: 'none', // Collapse all endpoints by default
    filter: true, // Enable search/filter
    showRequestDuration: true, // Show request timing
    syntaxHighlight: {
      theme: 'monokai', // Code highlighting theme
    },
  },
  customSiteTitle: 'Telegram Signal Bot API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c3e50; font-size: 36px; }
  `,
});
```

### **Adding New Endpoints**

To document new endpoints, add Swagger decorators:

```typescript
@ApiTags('users')
@Controller('users')
export class UserController {
  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Create a new user account',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  create(@Body() createUserDto: CreateUserDto) {
    // Implementation
  }
}
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Swagger UI Not Loading**
   - Check if `@nestjs/swagger` is installed
   - Verify the setup function is called in `main.ts`
   - Check console for any errors

2. **Authentication Not Working**
   - Ensure JWT token is in correct format: `Bearer <token>`
   - Check if token is expired
   - Verify the token is valid

3. **Endpoint Documentation Missing**
   - Check if `@ApiTags` decorator is added to controller
   - Verify `@ApiOperation` decorators are present
   - Ensure DTOs have `@ApiProperty` decorators

### **Debug Mode**

Enable detailed logging:

```typescript
// In swagger.config.ts
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    // ... other options
  },
  // Enable debug logging
  logger: console,
});
```

## 📱 **Mobile Testing**

### **Swagger UI Mobile**

- Swagger UI is responsive and works on mobile devices
- Use mobile browser to test API endpoints
- Perfect for testing webhook endpoints

### **API Testing Tools**

Alternative tools for API testing:

- **Postman** - Import OpenAPI spec
- **Insomnia** - REST API client
- **cURL** - Command line testing

## 🔄 **Version Control**

### **API Versioning**

The Swagger documentation supports versioning:

```typescript
const config = new DocumentBuilder()
  .setVersion('1.0.0')
  .addServer('http://localhost:3000', 'Development')
  .addServer('https://api.production.com', 'Production')
  .build();
```

### **Changelog**

Track API changes in the documentation:

- Update version numbers
- Document breaking changes
- Maintain backward compatibility

---

**Your API is now fully documented with Swagger! 🎉**

Access the documentation at `http://localhost:3000/api/docs` and start testing your endpoints interactively.
