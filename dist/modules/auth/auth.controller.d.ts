import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { RegisterDto } from './dto/register.dto';
import { LinkTelegramDto } from '../user/dto/link-telegram.dto';
import { Request as ExpressRequest } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            telegramId: any;
            chatId: any;
        };
    }>;
    linkTelegramAccount(linkTelegramDto: LinkTelegramDto, req: ExpressRequest & {
        user: any;
    }): Promise<{
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
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            telegramId: any;
            chatId: any;
        };
    }>;
    completeRegistration(token: string, completeRegistrationDto: CompleteRegistrationDto): Promise<{
        message: string;
        access_token: string;
        user: {
            id: any;
            username: any;
            telegramId: any;
            chatId: any;
        };
    }>;
    getProfile(req: any): any;
    loginLocal(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            telegramId: any;
            chatId: any;
        };
    }>;
}
