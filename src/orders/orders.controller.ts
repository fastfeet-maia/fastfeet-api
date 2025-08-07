import {
  Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, Request, Query
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DeliverOrderDto } from './dto/deliver-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('my-deliveries')
  findMyDeliveries(@Request() req) {
    const deliverymanId = req.user.userId;
    return this.ordersService.findAllByDeliverymanId(deliverymanId);
  }

  @Get('nearby')
  findNearby(@Query('city') city: string, @Query('neighborhood') neighborhood: string) {
    return this.ordersService.findAllNearby(city, neighborhood);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/withdraw')
  withdrawOrder(@Param('id') id: string, @Request() req) {
    const deliverymanId = req.user.userId;
    return this.ordersService.withdraw(id, deliverymanId);
  }

  @Patch(':id/deliver')
  deliverOrder(
    @Param('id') id: string,
    @Request() req,
    @Body() deliverOrderDto: DeliverOrderDto,
  ) {
    const deliverymanId = req.user.userId;
    return this.ordersService.deliver(id, deliverymanId, deliverOrderDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}