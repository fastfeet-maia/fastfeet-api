import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DeliverOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  photoUrl: string;
}