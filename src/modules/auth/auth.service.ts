import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { UserService } from '../user/user.service';
import { RegistrationTokenService } from './registration-token.service';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private registrationTokenService: RegistrationTokenService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user._id,
      telegramId: user.telegramId,
      chatId: user.chatId,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
      user: {
        id: user._id,
        username: user.username,
        telegramId: user.telegramId,
        chatId: user.chatId,
      },
    };
  }

  async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      username,
      password: hashedPassword,
    });

    return this.login(user);
  }

  async completeRegistrationWithToken(
    token: string,
    username: string,
    password: string,
  ) {
    // Verify the registration token
    const tokenPayload =
      this.registrationTokenService.verifyRegistrationToken(token);

    // Check if user already exists with this telegramId
    const existingUser = await this.userService.findByTelegramId(
      tokenPayload.telegramId,
    );
    if (existingUser) {
      throw new BadRequestException(
        'User with this Telegram ID already exists',
      );
    }

    // Check if username is already taken
    const existingUsername = await this.userService.findByUsername(username);
    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }

    // Complete registration
    const user = await this.register(username, password);

    return {
      ...user,
      message:
        'Registration completed successfully! Your account is now linked to Telegram.',
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateRegistrationToken(token: string) {
    try {
      const payload =
        this.registrationTokenService.verifyRegistrationToken(token);
      return {
        isValid: true,
        telegramId: payload.telegramId,
        chatId: payload.chatId,
        // expiresIn: payload.exp ? new Date(payload.exp * 1000) : null,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  async linkTelegramAccount(linkToken: string, userId: string) {
    try {
      // Verify and decode the registration token
      const tokenPayload =
        this.registrationTokenService.verifyRegistrationToken(linkToken);

      // Extract telegramId and chatId from the token
      const { telegramId, chatId } = tokenPayload;

      if (!telegramId || !chatId) {
        throw new BadRequestException(
          'Invalid token payload: missing telegramId or chatId',
        );
      }

      // Link the telegram account to the user
      const updatedUser = await this.userService.linkTelegramAccount(
        userId,
        telegramId,
        chatId,
      );

      return {
        success: true,
        message: 'Telegram account linked successfully',
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          telegramId: updatedUser.telegramId,
          chatId: updatedUser.chatId,
          isVerified: updatedUser.isVerified,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
