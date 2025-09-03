import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Query,
  Patch,
  Delete,
  Request,
} from '@nestjs/common';
import {
  NotificationService,
  // NotificationPayload,
} from './notification.service';
import { SocketGateway } from '../socket/socket.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationType, NotificationPriority } from './notification.entity';
import { EventsType } from '@/utils/constants/eventsType';
import { MonitorEventType } from '../alert';
// import { NotificationGateway } from './notification.gateway';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    // private readonly socketGateway: SocketGateway,
  ) {}

  @Post('test/sample-alert')
  @UseGuards(JwtAuthGuard)
  async sendSampleAlert(
    @Body() payload: { userId?: string; symbol?: string },
    @Request() req,
  ) {
    const userId = req.user.id;
    console.log('userId', userId, req.user);
    try {
      const sampleAlert = {
        type: NotificationType.ALERT_TRIGGERED,
        data: {
          alertId: 'alert_' + Date.now(),
          symbol: payload.symbol || 'BTCUSDT',
          eventType: MonitorEventType.RSI_CROSSOVER_HIGH,
          message: 'RSI overbought alert triggered - BTC price is above 70 RSI',
          timestamp: new Date(),
          price: 43500.5,
          rsi: 72.5,
          volume: 1250000,
          timeframe: '1h',
          priority: 'high',
          metadata: {
            source: 'technical_analysis',
            confidence: 0.85,
            recommendation: 'Consider taking profits or setting stop-loss',
          },
        },
      };

      // If userId is provided, send to specific user, otherwise broadcast to all
      if (userId) {
        this.notificationService.emitNotification({
          ...sampleAlert,
          userId: userId,
        });
        return {
          success: true,
          message: 'Sample alert sent to user',
          userId: userId,
          alert: sampleAlert,
        };
      } else {
        // Broadcast to all connected users
        // this.notificationService.emitNotification(sampleAlert);
        return {
          success: true,
          message: 'Sample alert broadcasted to all users',
          alert: sampleAlert,
        };
      }
    } catch (error) {
      console.error('Error sending sample alert:', error);
      return {
        success: false,
        message: 'Failed to send sample alert',
        error: error.message,
      };
    }
  }

  @Post('test/price-alert')
  @UseGuards(JwtAuthGuard)
  async sendPriceAlert(
    @Body() payload: { userId?: string; symbol?: string; price?: number },
  ) {
    try {
      const priceAlert = {
        type: 'price_alert',
        data: {
          alertId: 'price_' + Date.now(),
          symbol: payload.symbol || 'ETHUSDT',
          eventType: 'PRICE_ABOVE',
          message: `Price alert: ${payload.symbol || 'ETHUSDT'} is above $${payload.price || 3200}`,
          timestamp: new Date(),
          currentPrice: payload.price || 3250.75,
          targetPrice: payload.price || 3200,
          change: '+2.5%',
          volume: 850000,
          timeframe: '15m',
          priority: 'medium',
          metadata: {
            source: 'price_monitoring',
            confidence: 0.95,
            trend: 'bullish',
          },
        },
      };

      if (payload.userId) {
        this.notificationService.emitNotification(priceAlert);
        return {
          success: true,
          message: 'Price alert sent to user',
          userId: payload.userId,
          alert: priceAlert,
        };
      } else {
        this.notificationService.emitNotification(priceAlert);
        return {
          success: true,
          message: 'Price alert broadcasted to all users',
          alert: priceAlert,
        };
      }
    } catch (error) {
      console.error('Error sending price alert:', error);
      return {
        success: false,
        message: 'Failed to send price alert',
        error: error.message,
      };
    }
  }

  // @Post('test/order-update')
  // @UseGuards(JwtAuthGuard)
  // async sendOrderUpdate(@Body() payload: { userId?: string; symbol?: string }) {
  //   try {
  //     const orderUpdate = {
  //       type: 'order_update',
  //       data: {
  //         orderId: 'order_' + Date.now(),
  //         symbol: payload.symbol || 'BTCUSDT',
  //         status: 'filled',
  //         side: 'buy',
  //         quantity: 0.1,
  //         price: 43500.0,
  //         timestamp: new Date(),
  //         message: 'Order filled successfully',
  //         metadata: {
  //           exchange: 'binance',
  //           orderType: 'market',
  //           fees: 4.35,
  //         },
  //       },
  //     };

  //     if (payload.userId) {
  //       this.socketGateway.sendToUser(
  //         payload.userId,
  //         'order_update',
  //         orderUpdate,
  //       );
  //       return {
  //         success: true,
  //         message: 'Order update sent to user',
  //         userId: payload.userId,
  //         update: orderUpdate,
  //       };
  //     } else {
  //       this.notificationService.emitNotification(orderUpdate);
  //       return {
  //         success: true,
  //         message: 'Order update broadcasted to all users',
  //         update: orderUpdate,
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Error sending order update:', error);
  //     return {
  //       success: false,
  //       message: 'Failed to send order update',
  //       error: error.message,
  //     };
  //   }
  // }

  // ==================== NOTIFICATION MANAGEMENT ENDPOINTS ====================

  /**
   * Get user notifications with pagination and filtering
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('symbol') symbol?: string,
  ) {
    const userId = req.user.id;
    const result = await this.notificationService.getUserNotifications(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      type,
      symbol,
    });

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get notification statistics for a user
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getNotificationStats(@Request() req) {
    const userId = req.user.id;
    const stats = await this.notificationService.getNotificationStats(userId);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Mark a single notification as read
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const notification = await this.notificationService.markAsRead(id, userId);

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found or already processed',
      };
    }

    return {
      success: true,
      message: 'Notification marked as read',
      data: notification,
    };
  }

  /**
   * Mark multiple notifications as read (bulk operation)
   */
  @Patch('bulk/read')
  @UseGuards(JwtAuthGuard)
  async markMultipleAsRead(
    @Body() body: { notificationIds: string[] },
    @Request() req,
  ) {
    const userId = req.user.id;
    const result = await this.notificationService.markMultipleAsRead(
      body.notificationIds,
      userId,
    );

    return {
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: result,
    };
  }

  /**
   * Mark all notifications as read for a user
   */
  @Patch('bulk/read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(
    @Body() body: { type?: string; symbol?: string },
    @Request() req,
  ) {
    const userId = req.user.id;
    const result = await this.notificationService.markAllAsRead(userId, body);

    return {
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: result,
    };
  }

  /**
   * Archive a notification
   */
  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  async archiveNotification(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const notification = await this.notificationService.archiveNotification(
      id,
      userId,
    );

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found',
      };
    }

    return {
      success: true,
      message: 'Notification archived',
      data: notification,
    };
  }

  /**
   * Archive multiple notifications (bulk operation)
   */
  @Patch('bulk/archive')
  @UseGuards(JwtAuthGuard)
  async archiveMultiple(
    @Body() body: { notificationIds: string[] },
    @Request() req,
  ) {
    const userId = req.user.id;
    const result = await this.notificationService.archiveMultiple(
      body.notificationIds,
      userId,
    );

    return {
      success: true,
      message: `Archived ${result.modifiedCount} notifications`,
      data: result,
    };
  }

  /**
   * Delete a notification permanently
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotification(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const deleted = await this.notificationService.deleteNotification(
      id,
      userId,
    );

    if (!deleted) {
      return {
        success: false,
        message: 'Notification not found',
      };
    }

    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  /**
   * Delete multiple notifications permanently (bulk operation)
   */
  @Delete('bulk')
  @UseGuards(JwtAuthGuard)
  async deleteMultiple(
    @Body() body: { notificationIds: string[] },
    @Request() req,
  ) {
    const userId = req.user.id;
    const result = await this.notificationService.deleteMultiple(
      body.notificationIds,
      userId,
    );

    return {
      success: true,
      message: `Deleted ${result.deletedCount} notifications`,
      data: result,
    };
  }

  /**
   * Send bulk notifications to multiple users (admin only)
   */
  @Post('bulk/send')
  @UseGuards(JwtAuthGuard)
  async sendBulkNotifications(
    @Body()
    body: {
      userIds: string[];
      type: NotificationType;
      priority: NotificationPriority;
      title: string;
      message: string;
      data?: Record<string, any>;
      symbol?: string;
      timeframe?: string;
      eventType?: string;
      alertId?: string;
      tags?: string[];
      metadata?: Record<string, any>;
      isPersistent?: boolean;
      expiresAt?: string;
    },
  ) {
    const notificationData = {
      ...body,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    };

    const result = await this.notificationService.sendBulkNotifications(
      body.userIds,
      notificationData,
    );

    return {
      success: true,
      message: `Bulk notification sent: ${result.createdCount} created, ${result.failedCount} failed`,
      data: result,
    };
  }

  /**
   * Clean up expired notifications (admin only)
   */
  @Post('cleanup/expired')
  @UseGuards(JwtAuthGuard)
  async cleanupExpiredNotifications() {
    const result = await this.notificationService.cleanupExpiredNotifications();

    return {
      success: true,
      message: `Cleaned up ${result.deletedCount} expired notifications`,
      data: result,
    };
  }
}
