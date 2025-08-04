import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatusChangedEvent } from './events/order-status-changed.event';
import { DeliverOrderDto } from './dto/deliver-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { recipientId, deliverymanId } = createOrderDto;
    const recipientExists = await this.prisma.recipient.findUnique({ where: { id: recipientId } });
    if (!recipientExists) {
      throw new NotFoundException('Destinatário não encontrado.');
    }
    const deliverymanExists = await this.prisma.user.findUnique({ where: { id: deliverymanId } });
    if (!deliverymanExists) {
      throw new NotFoundException('Entregador não encontrado.');
    }
    return this.prisma.order.create({ data: { recipientId, deliverymanId } });
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({ include: { recipient: true, deliveryman: true } });
    return orders.map((order) => {
      if (order.deliveryman) {
        const { password, ...deliveryman } = order.deliveryman;
        return { ...order, deliveryman };
      }
      return order;
    });
  }

  async findOne(id: string) {
    try {
      const order = await this.prisma.order.findUniqueOrThrow({ where: { id }, include: { recipient: true, deliveryman: true } });
      if (order.deliveryman) {
        const { password, ...deliveryman } = order.deliveryman;
        return { ...order, deliveryman };
      }
      return order;
    } catch (error) {
      throw new NotFoundException(`Encomenda com ID "${id}" não encontrada.`);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const orderBeforeUpdate = await this.prisma.order.findUnique({ where: { id } });
    if (!orderBeforeUpdate) {
      throw new NotFoundException(`Encomenda com ID "${id}" não encontrada.`);
    }
    const updatedOrder = await this.prisma.order.update({ where: { id }, data: updateOrderDto });
    if (updateOrderDto.status && orderBeforeUpdate.status !== updatedOrder.status) {
      const event = new OrderStatusChangedEvent();
      event.order = updatedOrder;
      this.eventEmitter.emit('order.status-changed', event);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.order.delete({ where: { id } });
  }

  async findAllByDeliverymanId(deliverymanId: string) {
    return this.prisma.order.findMany({ where: { deliverymanId }, include: { recipient: true } });
  }

  async deliver(id: string, deliverymanId: string, deliverOrderDto: DeliverOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Encomenda com ID "${id}" não encontrada.`);
    }
    if (order.deliverymanId !== deliverymanId) {
      throw new ForbiddenException('Você não tem permissão para entregar esta encomenda.');
    }
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: 'DELIVERED', photoUrl: deliverOrderDto.photoUrl, deliveredAt: new Date() },
    });
    const event = new OrderStatusChangedEvent();
    event.order = updatedOrder;
    this.eventEmitter.emit('order.status-changed', event);
    return updatedOrder;
  }

  async findAllNearby(city: string, neighborhood: string) {
    return this.prisma.order.findMany({
      where: {
        recipient: {
          city: { equals: city, mode: 'insensitive' },
          neighborhood: { equals: neighborhood, mode: 'insensitive' },
        },
        status: 'WAITING',
      },
      include: {
        recipient: true,
      },
    });
  }
}