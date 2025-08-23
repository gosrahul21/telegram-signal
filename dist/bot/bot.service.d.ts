import { OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { RegistrationTokenService } from '../modules/auth/registration-token.service';
import { UserService } from '../modules/user/user.service';
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
}
