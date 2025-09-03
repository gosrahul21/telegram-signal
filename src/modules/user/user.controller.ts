import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create new user',
    description: 'Create a new user account with username and password',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        username: { type: 'string', example: 'john_doe' },
        telegramId: { type: 'number', example: 123456789 },
        chatId: { type: 'number', example: 123456789 },
        isVerified: { type: 'boolean', example: false },
        lastLogin: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or user already exists',
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  create(
    @Body()
    createUserData: CreateUserDto,
  ) {
    return this.userService.create(createUserData);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users (admin only)',
  })
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'john_doe' },
          telegramId: { type: 'number', example: 123456789 },
          chatId: { type: 'number', example: 123456789 },
          isVerified: { type: 'boolean', example: true },
          lastLogin: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  findAll() {
    return this.userService.findAll();
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        username: { type: 'string', example: 'john_doe' },
        telegramId: { type: 'number', example: 123456789 },
        chatId: { type: 'number', example: 123456789 },
        isVerified: { type: 'boolean', example: true },
        lastLogin: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  getProfile(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        username: { type: 'string', example: 'john_doe' },
        telegramId: { type: 'number', example: 123456789 },
        chatId: { type: 'number', example: 123456789 },
        isVerified: { type: 'boolean', example: true },
        lastLogin: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    description: 'User update data',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'new_username' },
        password: { type: 'string', example: 'newpassword123' },
        isVerified: { type: 'boolean', example: true },
      },
    },
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        username: { type: 'string', example: 'new_username' },
        telegramId: { type: 'number', example: 123456789 },
        chatId: { type: 'number', example: 123456789 },
        isVerified: { type: 'boolean', example: true },
        lastLogin: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.userService.update(id, updateData);
  }


  updateTelegramData(@Param('id') id: string, @Body() updateData: any) {
    return this.userService.linkTelegramAccount(id, updateData.telegramId, updateData.chatId);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user account by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Patch(':id/verify')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verify user account',
    description: 'Mark a user account as verified',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'User verified successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        username: { type: 'string', example: 'john_doe' },
        telegramId: { type: 'number', example: 123456789 },
        chatId: { type: 'number', example: 123456789 },
        isVerified: { type: 'boolean', example: true },
        lastLogin: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  verifyUser(@Param('id') id: string) {
    return this.userService.verifyUser(id);
  }
}
