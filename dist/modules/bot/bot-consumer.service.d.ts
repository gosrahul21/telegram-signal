import { BotService } from './bot.service';
import { UserService } from '../user/user.service';
export declare class BotNotificationListenerService {
    private readonly botService;
    private readonly userService;
    private readonly logger;
    constructor(botService: BotService, userService: UserService);
    handleNotificationCreated(payload: any): Promise<void>;
    private formatNotificationMessage;
    private formatGeneralNotificationMessage;
    private formatAlertMessage;
    private formatOrderUpdateMessage;
    private formatOrderAlertMessage;
    private formatPriceTargetMessage;
    private formatTechnicalIndicatorMessage;
    private formatMarketAlertMessage;
    sendCustomMessage(userId: string, message: string): Promise<boolean>;
    sendBulkMessages(userIds: string[], message: string): Promise<{
        sent: number;
        failed: number;
        errors: string[];
    }>;
}
