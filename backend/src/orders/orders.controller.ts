import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  @Get('active/customer/:id')
  getActiveCustomerOrder(@Param('id') id: string) {
    return this.ordersService.getActiveCustomerOrder(id);
  }

  @Get('customer/:id')
  getCustomerOrders(@Param('id') id: string) {
    return this.ordersService.getCustomerOrders(id);
  }

  @Get('vendor/:id')
  getVendorOrders(@Param('id') id: string) {
    return this.ordersService.getVendorOrders(id);
  }

  @Get('admin/all')
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get('admin/stats')
  getAdminStats() {
    return this.ordersService.getAdminStats();
  }

  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }
}

