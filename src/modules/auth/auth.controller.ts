import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Query,
  Param,
  BadRequestException,
  UnauthorizedException,
  Req,
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
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LinkTelegramDto } from '../user/dto/link-telegram.dto';
import { GenerateRegistrationTokenDto } from './dto/generate-registration-token.dto';
import { Request as ExpressRequest } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with username and password to receive JWT token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'john_doe' },
            telegramId: { type: 'number', example: 123456789 },
            chatId: { type: 'number', example: 123456789 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('link-telegram')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Link Telegram account',
    description:
      'Link a Telegram account to an existing user using a registration token',
  })
  @ApiBody({ type: LinkTelegramDto })
  @ApiResponse({
    status: 200,
    description: 'Telegram account linked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Telegram account linked successfully',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'john_doe' },
            telegramId: { type: 'number', example: 123456789 },
            chatId: { type: 'number', example: 123456789 },
            isVerified: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated or invalid token',
  })
  @ApiBadRequestResponse({ description: 'Invalid link token or token expired' })
  async linkTelegramAccount(
    @Body() linkTelegramDto: LinkTelegramDto,
    @Req() req: ExpressRequest & { user: any },
  ) {
    try {
      const { linkToken } = linkTelegramDto;
      const userId = req.user.id;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      return await this.authService.linkTelegramAccount(linkToken, userId);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      // Handle other errors
      throw new BadRequestException(
        error.message || 'Failed to link telegram account',
      );
    }
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description:
      'Register a new user with username, password, and Telegram information',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User registered successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'john_doe' },
            telegramId: { type: 'number', example: 123456789 },
            chatId: { type: 'number', example: 123456789 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or user already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.username,
      registerDto.password,
    );
  }

  @Post('complete-registration/:token')
  @ApiOperation({
    summary: 'Complete registration with token',
    description: 'Complete user registration using a valid registration token',
  })
  @ApiParam({
    name: 'token',
    description: 'Registration token received from Telegram bot',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiBody({ type: CompleteRegistrationDto })
  @ApiCreatedResponse({
    description: 'Registration completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Registration completed successfully',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'john_doe' },
            telegramId: { type: 'number', example: 123456789 },
            chatId: { type: 'number', example: 123456789 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid token or token expired' })
  async completeRegistration(
    @Param('token') token: string,
    @Body() completeRegistrationDto: CompleteRegistrationDto,
  ) {
    return this.authService.completeRegistrationWithToken(
      token,
      completeRegistrationDto.username,
      completeRegistrationDto.password,
    );
  }

  //   @Get('validate-registration-token/:token')
  //   async validateRegistrationToken(@Param('token') token: string) {
  //     return this.authService.validateRegistrationToken(token);
  //   }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve the current authenticated user profile',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
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
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login-local')
  @ApiOperation({
    summary: 'Local authentication login',
    description: 'Alternative login method using local strategy',
  })
  @ApiResponse({
    status: 200,
    description: 'Local login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'john_doe' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async loginLocal(@Request() req) {
    return this.authService.login(req.user);
  }
}
