import { JwtService } from '@nestjs/jwt';
import { RegistrationTokenService } from './registration-token.service';
import { UserService } from '../user';
export declare class AuthService {
    private userService;
    private jwtService;
    private registrationTokenService;
    constructor(userService: UserService, jwtService: JwtService, registrationTokenService: RegistrationTokenService);
    validateUser(username: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            telegramId: any;
            chatId: any;
        };
    }>;
    register(username: string, password: string): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            telegramId: any;
            chatId: any;
        };
    }>;
    completeRegistrationWithToken(token: string, username: string, password: string): Promise<{
        message: string;
        access_token: string;
        user: {
            id: any;
            username: any;
            telegramId: any;
            chatId: any;
        };
    }>;
    verifyToken(token: string): Promise<any>;
    validateRegistrationToken(token: string): Promise<{
        isValid: boolean;
        telegramId: number;
        chatId: number;
        error?: undefined;
    } | {
        isValid: boolean;
        error: any;
        telegramId?: undefined;
        chatId?: undefined;
    }>;
    linkTelegramAccount(linkToken: string, userId: string): Promise<{
        success: boolean;
        message: string;
        user: {
            id: any;
            username: string;
            telegramId: number;
            chatId: number;
            isVerified: boolean;
        };
    }>;
}
