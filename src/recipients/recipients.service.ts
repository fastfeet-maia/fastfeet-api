import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipientDto } from './dto/create-recipient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRecipientDto } from './dto/update-recipient.dto';

@Injectable()
export class RecipientsService {
  constructor(private prisma: PrismaService) {}

  create(createRecipientDto: CreateRecipientDto) {
    return this.prisma.recipient.create({
      data: createRecipientDto,
    });
  }

  findAll() {
    return this.prisma.recipient.findMany();
  }

  async findOne(id: string) {
    try {
      return await this.prisma.recipient.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Destinatário com ID "${id}" não encontrado.`);
    }
  }

  async update(id: string, updateRecipientDto: UpdateRecipientDto) {
    await this.findOne(id);

    return this.prisma.recipient.update({
      where: { id },
      data: updateRecipientDto,
    });
  }

  // NOVO MÉTODO
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.recipient.delete({
      where: { id },
    });
  }
}