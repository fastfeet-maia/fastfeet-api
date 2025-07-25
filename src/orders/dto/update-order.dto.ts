import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from '@prisma/client';

// O PartialType torna os campos do CreateOrderDto opcionais.
// Adicionamos os outros campos que podem ser atualizados.
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}