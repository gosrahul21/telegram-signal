import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification, NotificationDocument } from './notification.entity';
export declare class NotificationService {
    private notificationModel;
    private readonly eventEmitter;
    private readonly logger;
    constructor(notificationModel: Model<NotificationDocument>, eventEmitter: EventEmitter2);
    createNotification(data: Partial<Notification>): Promise<Notification>;
    handleUserAlert(payload: any): Promise<void>;
    handleOrderAlert(payload: any): Promise<void>;
}
