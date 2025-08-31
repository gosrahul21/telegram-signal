import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventsType } from '@/utils/constants/eventsType';
import { SocketService } from './socket.service';

@Injectable()
export class SocketListenerService {
  private readonly logger = new Logger(SocketListenerService.name);

  constructor(private readonly socketService: SocketService) {}

  /**
   * Handle notification.created and send via socket
   */
  @OnEvent(EventsType.NOTIFICATION_CREATED, { async: true })
  async handleNotificationCreated(payload: any) {
    this.logger.log(`Pushing notification to user ${payload.userId}`);
    const sent = this.socketService.emitToUser(
      payload.userId.toString(),
      'notification',
      payload,
    );
    if (!sent) {
      this.logger.warn(`User ${payload.userId} not connected, skipping push`);
    }
  }

  /**
   * Example: listen for order updates
   */
  @OnEvent(EventsType.ORDER_UPDATED, { async: true })
  async handleOrderUpdated(payload: any) {
    this.logger.log(`Pushing order update to user ${payload.userId}`);
    this.socketService.emitToUser(
      payload.userId.toString(),
      'order_update',
      payload,
    );
  }
}
