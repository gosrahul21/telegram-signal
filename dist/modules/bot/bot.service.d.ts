import { OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { RegistrationTokenService } from '@/modules/auth/registration-token.service';
import { UserService } from '@/modules/user/user.service';
export declare class BotService implements OnModuleInit {
    private registrationTokenService;
    private userService;
    private bot;
    constructor(registrationTokenService: RegistrationTokenService, userService: UserService);
    onModuleInit(): void;
    getBot(): Bot<import("grammy").Context, import("grammy").Api<import("grammy").RawApi>>;
    private setupCommands;
    private handleStartCommand;
    private handleSubscribeCommand;
    private handleUnsubscribeCommand;
    start(): Promise<void>;
    stop(): Promise<void>;
    sendMessage(chatId: string, message: string, options?: {
        parse_mode?: 'HTML' | 'Markdown';
        disable_web_page_preview?: boolean;
        disable_notification?: boolean;
    }): Promise<boolean>;
    sendBulkMessage(chatIds: string[], message: string, options?: {
        parse_mode?: 'HTML' | 'Markdown';
        disable_web_page_preview?: boolean;
        disable_notification?: boolean;
    }): Promise<{
        sent: number;
        failed: number;
        errors: string[];
    }>;
    sendSignalMessage(chatId: string, signalData: {
        symbol: string;
        type: string;
        price?: number;
        rsi?: number;
        timeframe?: string;
        message?: string;
    }): Promise<boolean>;
    sendAlertMessage(chatId: string, alertData: {
        symbol: string;
        eventType: string;
        price?: number;
        rsi?: number;
        timeframe?: string;
        alertId?: string;
    }): Promise<boolean>;
}
