import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderStatusChangedEvent } from '../events/order-status-changed.event';

@Injectable()
export class OrderStatusChangedListener {
  @OnEvent('order.status-changed')
  handleOrderStatusChangedEvent(event: OrderStatusChangedEvent) {
    console.log('===================================================');
    console.log('ATENÇÃO: O status da encomenda foi alterado!');
    console.log('Disparando notificação para o destinatário...');
    console.log('ID da Encomenda:', event.order.id);
    console.log('Novo Status:', event.order.status);
    console.log('===================================================');
  }
}