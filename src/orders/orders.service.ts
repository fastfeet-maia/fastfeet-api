import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { recipientId, deliverymanId } = createOrderDto;

    const recipientExists = await this.prisma.recipient.findUnique({
      where: { id: recipientId },
    });
    if (!recipientExists) {
      throw new NotFoundException('Destinatário não encontrado.');
    }

    const deliverymanExists = await this.prisma.user.findUnique({
      where: { id: deliverymanId },
    });
    if (!deliverymanExists) {
      throw new NotFoundException('Entregador não encontrado.');
    }

    return this.prisma.order.create({
      data: {
        recipientId,
        deliverymanId,
      },
    });
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: {
        recipient: true,
        deliveryman: true,
      },
    });

    // Mapeia os resultados para remover a senha de cada entregador
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
      const order = await this.prisma.order.findUniqueOrThrow({
        where: { id },
        include: {
          recipient: true,
          deliveryman: true,
        },
      });

      // Remove a senha do entregador
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
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.order.delete({
      where: { id },
    });
  }
}