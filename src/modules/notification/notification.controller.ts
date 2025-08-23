import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import {
  NotificationService,
  NotificationPayload,
} from './notification.service';
import { NotificationGateway } from './notification.gateway';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post('telegram')
  async sendTelegramNotification(@Body() payload: NotificationPayload) {
    const result = await this.notificationService.sendTelegramNotification(
      payload.userId,
      payload.message,
    );
    return { success: result, userId: payload.userId };
  }

  @Post('telegram/bulk')
  async sendTelegramNotificationToMultiple(
    @Body() payload: { userIds: string[]; message: string },
  ) {
    const result =
      await this.notificationService.sendTelegramNotificationToMultiple(
        payload.userIds,
        payload.message,
      );
    return result;
  }

  @Post('signal')
  async sendSignalNotification(
    @Body() payload: { userId: string; signalData: any },
  ) {
    const result = await this.notificationService.sendSignalNotification(
      payload.userId,
      payload.signalData,
    );
    return { success: result, userId: payload.userId };
  }

  @Post('alert')
  async sendAlertNotification(
    @Body() payload: { userId: string; alertData: any },
  ) {
    const result = await this.notificationService.sendAlertNotification(
      payload.userId,
      payload.alertData,
    );
    return { success: result, userId: payload.userId };
  }

  @Post('status')
  async sendStatusNotification(
    @Body() payload: { userId: string; statusData: any },
  ) {
    const result = await this.notificationService.sendStatusNotification(
      payload.userId,
      payload.statusData,
    );
    return { success: result, userId: payload.userId };
  }

  @Post('multi-channel')
  async sendMultiChannelNotification(@Body() payload: NotificationPayload) {
    const result =
      await this.notificationService.sendMultiChannelNotification(payload);
    return result;
  }

  @Post('websocket/broadcast')
  async broadcastWebSocketMessage(@Body() payload: { message: any }) {
    const result = this.notificationService.broadcastWebSocketMessage(
      payload.message,
    );
    return result;
  }

  @Post('websocket/user/:userId')
  async sendWebSocketMessage(
    @Param('userId') userId: string,
    @Body() payload: { message: any },
  ) {
    const result = this.notificationService.sendWebSocketMessage(
      userId,
      payload.message,
    );
    return { success: result, userId };
  }

  @Get('websocket/connections/count')
  async getConnectedUsersCount() {
    const count = this.notificationService.getConnectedUsersCount();
    return { connectedUsers: count };
  }

  @Get('websocket/connections/users')
  async getConnectedUserIds() {
    const userIds = this.notificationService.getConnectedUserIds();
    return { userIds };
  }

  @Post('websocket/broadcast-symbol')
  async broadcastToSymbol(
    @Body() payload: { symbol: string; type: string; message: any },
  ) {
    this.notificationGateway.broadcastToSymbol(
      payload.symbol,
      payload.type,
      payload.message,
    );
    return {
      success: true,
      symbol: payload.symbol,
      type: payload.type,
      message: 'Broadcast initiated',
    };
  }

  @Post('websocket/user/:userId/send')
  async sendToUser(
    @Param('userId') userId: string,
    @Body() payload: { event: string; data: any },
  ) {
    this.notificationGateway.sendToUser(userId, payload.event, payload.data);
    return {
      success: true,
      userId,
      event: payload.event,
      message: 'Message sent',
    };
  }
}
