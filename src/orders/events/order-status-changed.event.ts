import { Order } from '@prisma/client';

export class OrderStatusChangedEvent {
  order: Order;
}