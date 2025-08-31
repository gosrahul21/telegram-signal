import { SocketService } from './socket.service';
export declare class SocketListenerService {
    private readonly socketService;
    private readonly logger;
    constructor(socketService: SocketService);
    handleNotificationCreated(payload: any): Promise<void>;
    handleOrderUpdated(payload: any): Promise<void>;
}
