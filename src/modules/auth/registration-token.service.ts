import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface RegistrationTokenPayload {
  telegramId: number;
  chatId?: number;
  type: 'registration';
  exp?: number;
}

@Injectable()
export class RegistrationTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateRegistrationToken(
    telegramId: number,
    chatId?: number,
  ): string {
    const payload: RegistrationTokenPayload = {
      telegramId,
      chatId,
      type: 'registration',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      expiresIn: '5m', // Registration tokens expire in 5 minutes
    });
  }

  verifyRegistrationToken(token: string): RegistrationTokenPayload {
    try {
      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      });

      if (payload.type !== 'registration') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid or expired registration token');
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.jwtService.decode(token) as any;
      if (!payload || !payload.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}
