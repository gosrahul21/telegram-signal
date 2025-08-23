# 🚀 Migration from Mongoose to TypeORM

This project has been successfully migrated from **Mongoose (MongoDB)** to **TypeORM (PostgreSQL/MySQL)** for better type safety, relationships, and database management.

## 🔄 **What Changed**

### **Before (Mongoose)**

- MongoDB with Mongoose schemas
- Embedded subscription arrays in user documents
- NoSQL document structure

### **After (TypeORM)**

- PostgreSQL/MySQL with TypeORM entities
- Separate tables with proper relationships
- SQL relational structure with foreign keys

## 🏗️ **New Database Structure**

### **Users Table**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatId BIGINT UNIQUE NOT NULL,
  telegramId BIGINT UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Subscriptions Table**

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pairName VARCHAR(100) NOT NULL,
  duration ENUM('1h', '4h', '1d') DEFAULT '1h',
  isActive BOOLEAN DEFAULT true,
  triggerCount INT DEFAULT 0,
  lastTriggered TIMESTAMP NULL,
  userId UUID NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## 📁 **New File Structure**

```
src/modules/user/
├── entities/
│   ├── user.entity.ts          # User entity with TypeORM decorators
│   └── subscription.entity.ts  # Subscription entity with relationships
├── dto/
│   ├── create-user.dto.ts      # User creation DTO
│   ├── update-user.dto.ts      # User update DTO
│   ├── create-subscription.dto.ts # Subscription creation DTO
│   └── update-subscription.dto.ts # Subscription update DTO
├── user.service.ts              # Updated service with TypeORM
├── user.controller.ts           # New REST controller
└── user.module.ts              # Updated module with TypeORM
```

## 🛠️ **Environment Variables**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=telegram_signal

# Node Environment
NODE_ENV=development
```

## 🚀 **Getting Started**

### **1. Install Dependencies**

```bash
npm install @nestjs/typeorm typeorm pg @types/pg
# or for MySQL
npm install @nestjs/typeorm typeorm mysql2 @types/mysql
```

### **2. Set Up Database**

```bash
# PostgreSQL
createdb telegram_signal

# MySQL
mysql -u root -p -e "CREATE DATABASE telegram_signal;"
```

### **3. Run Migrations**

```bash
# Generate migration (if needed)
npm run typeorm:generate-migration

# Run migrations
npm run typeorm:run-migrations
```

### **4. Start Application**

```bash
npm run start:dev
```

## 🔧 **Database Configuration**

### **PostgreSQL (Recommended)**

```typescript
// src/config/database.config.ts
{
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'telegram_signal',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Only in development
}
```

### **MySQL**

```typescript
{
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'telegram_signal',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Only in development
}
```

## 📊 **API Endpoints**

### **User Management**

- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### **Subscription Management**

- `GET /api/users/:id/subscriptions` - Get user subscriptions
- `POST /api/users/:id/subscriptions` - Create subscription
- `PATCH /api/users/subscriptions/:id` - Update subscription
- `PATCH /api/users/subscriptions/:id/toggle` - Toggle subscription
- `PATCH /api/users/subscriptions/:id/increment-trigger` - Increment trigger count
- `DELETE /api/users/subscriptions/:id` - Delete subscription

## 🔐 **Security Features**

- **JWT Authentication** - All endpoints protected
- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Class-validator decorators
- **SQL Injection Protection** - TypeORM parameterized queries
- **Cascade Deletes** - Proper relationship cleanup

## 📈 **Benefits of TypeORM**

✅ **Type Safety** - Full TypeScript support  
✅ **Relationships** - Proper foreign key constraints  
✅ **Migrations** - Version-controlled database changes  
✅ **Query Builder** - Powerful SQL query construction  
✅ **Transactions** - ACID compliance  
✅ **Performance** - Optimized SQL queries  
✅ **Scalability** - Better for complex queries

## 🔄 **Migration Process**

### **Data Migration (if needed)**

```typescript
// Example migration script
async function migrateFromMongo() {
  const mongoUsers = await mongoUserModel.find().exec();

  for (const mongoUser of mongoUsers) {
    const user = await userService.create({
      username: mongoUser.username,
      password: mongoUser.password,
      telegramId: mongoUser.telegramId,
      chatId: mongoUser.chatId,
    });

    // Migrate subscriptions
    for (const sub of mongoUser.subscriptions) {
      await userService.createSubscription(user.id, {
        pairName: sub.pairName,
        duration: sub.duration,
      });
    }
  }
}
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Connection Failed** - Check database credentials and service status
2. **Entity Not Found** - Ensure entities are properly imported in modules
3. **Migration Errors** - Check database permissions and existing schema
4. **Type Errors** - Verify TypeORM decorators and entity definitions

### **Debug Mode**

```typescript
// Enable SQL logging
logging: true,
logger: 'advanced-console'
```

---

**The migration to TypeORM provides a more robust, scalable, and maintainable database architecture! 🎉**
