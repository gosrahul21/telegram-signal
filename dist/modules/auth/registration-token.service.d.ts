import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export interface RegistrationTokenPayload {
    telegramId: number;
    chatId?: number;
    type: 'registration';
    exp?: number;
}
export declare class RegistrationTokenService {
    private jwtService;
    private configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateRegistrationToken(telegramId: number, chatId?: number): string;
    verifyRegistrationToken(token: string): RegistrationTokenPayload;
    isTokenExpired(token: string): boolean;
}
