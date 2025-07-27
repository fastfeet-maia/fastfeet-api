import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderStatusChangedListener } from './listeners/order-status-changed.listener';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderStatusChangedListener],
})
export class OrdersModule {}