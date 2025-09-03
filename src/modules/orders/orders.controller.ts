import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import {
  BulkCreateOrderDto,
  BulkUpdateOrderDto,
  BulkCancelOrderDto,
  OrderExecutionDto,
} from './dto/bulk-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create a new order
   */
  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.id;
    const order = await this.ordersService.createOrder(userId, createOrderDto);

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  /**
   * Get orders with pagination and filtering
   */
  @Get()
  async getOrders(@Request() req, @Query() queryDto: QueryOrderDto) {
    const userId = req.user.id;
    const result = await this.ordersService.getOrders(userId, queryDto);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get order by ID
   */
  @Get(':id')
  async getOrderById(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    const order = await this.ordersService.getOrderById(userId, id);

    return {
      success: true,
      data: order,
    };
  }

  /**
   * Update order
   */
  @Put(':id')
  async updateOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const userId = req.user.id;
    const order = await this.ordersService.updateOrder(
      userId,
      id,
      updateOrderDto,
    );

    return {
      success: true,
      message: 'Order updated successfully',
      data: order,
    };
  }

  /**
   * Cancel order
   */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const userId = req.user.id;
    const order = await this.ordersService.cancelOrder(userId, id, body.reason);

    return {
      success: true,
      message: 'Order canceled successfully',
      data: order,
    };
  }

  /**
   * Delete order
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteOrder(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    await this.ordersService.deleteOrder(userId, id);

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  }

  /**
   * Get order statistics
   */
  @Get('stats/overview')
  async getOrderStats(@Request() req) {
    const userId = req.user.id;
    const stats = await this.ordersService.getOrderStats(userId);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get active orders
   */
  @Get('active/list')
  async getActiveOrders(@Request() req) {
    const userId = req.user.id;
    const orders = await this.ordersService.getActiveOrders(userId);

    return {
      success: true,
      data: orders,
    };
  }

  /**
   * Get orders by symbol
   */
  @Get('symbol/:symbol')
  async getOrdersBySymbol(@Request() req, @Param('symbol') symbol: string) {
    const userId = req.user.id;
    const orders = await this.ordersService.getOrdersBySymbol(userId, symbol);

    return {
      success: true,
      data: orders,
    };
  }

  /**
   * Get orders by signal
   */
  @Get('signal/:signalId')
  async getOrdersBySignal(@Param('signalId') signalId: string) {
    const orders = await this.ordersService.getOrdersBySignal(signalId);

    return {
      success: true,
      data: orders,
    };
  }

  /**
   * Bulk create orders
   */
  @Post('bulk/create')
  async bulkCreateOrders(
    @Request() req,
    @Body() bulkCreateDto: BulkCreateOrderDto,
  ) {
    const userId = req.user.id;
    const result = await this.ordersService.bulkCreateOrders(
      userId,
      bulkCreateDto,
    );

    return {
      success: true,
      message: `Bulk orders created: ${result.created.length} successful, ${result.failed.length} failed`,
      data: result,
    };
  }

  /**
   * Bulk update orders
   */
  @Patch('bulk/update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdateOrders(
    @Request() req,
    @Body() bulkUpdateDto: BulkUpdateOrderDto,
  ) {
    const userId = req.user.id;
    const result = await this.ordersService.bulkUpdateOrders(
      userId,
      bulkUpdateDto,
    );

    return {
      success: true,
      message: `Bulk orders updated: ${result.updated} successful, ${result.failed.length} failed`,
      data: result,
    };
  }

  /**
   * Bulk cancel orders
   */
  @Patch('bulk/cancel')
  @HttpCode(HttpStatus.OK)
  async bulkCancelOrders(
    @Request() req,
    @Body() bulkCancelDto: BulkCancelOrderDto,
  ) {
    const userId = req.user.id;
    const result = await this.ordersService.bulkCancelOrders(
      userId,
      bulkCancelDto,
    );

    return {
      success: true,
      message: `Bulk orders canceled: ${result.canceled} successful, ${result.failed.length} failed`,
      data: result,
    };
  }

  /**
   * Update order execution (for exchange callbacks)
   */
  @Patch(':id/execution')
  @HttpCode(HttpStatus.OK)
  async updateOrderExecution(
    @Request() req,
    @Param('id') id: string,
    @Body() executionDto: Omit<OrderExecutionDto, 'orderId'>,
  ) {
    const userId = req.user.id;
    const order = await this.ordersService.updateOrderExecution(userId, {
      ...executionDto,
      orderId: id,
    });

    return {
      success: true,
      message: 'Order execution updated successfully',
      data: order,
    };
  }

  /**
   * Calculate PnL for an order
   */
  @Post(':id/pnl')
  async calculateOrderPnL(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { currentPrice: number },
  ) {
    const userId = req.user.id;
    const pnl = await this.ordersService.calculateOrderPnL(
      userId,
      id,
      body.currentPrice,
    );

    return {
      success: true,
      data: pnl,
    };
  }

  /**
   * Get orders that need retry (admin only)
   */
  @Get('admin/retry/list')
  async getOrdersForRetry() {
    const orders = await this.ordersService.getOrdersForRetry();

    return {
      success: true,
      data: orders,
    };
  }

  /**
   * Clean up expired orders (admin only)
   */
  @Post('admin/cleanup/expired')
  @HttpCode(HttpStatus.OK)
  async cleanupExpiredOrders() {
    const result = await this.ordersService.cleanupExpiredOrders();

    return {
      success: true,
      message: `Cleaned up ${result.deletedCount} expired orders`,
      data: result,
    };
  }
}
