import { Controller, Post, Body, Get, Param, Patch, Delete, HttpCode } from '@nestjs/common';
import { RecipientsService } from './recipients.service';
import { CreateRecipientDto } from './dto/create-recipient.dto';
import { UpdateRecipientDto } from './dto/update-recipient.dto';

@Controller('recipients')
export class RecipientsController {
  constructor(private readonly recipientsService: RecipientsService) {}

  @Post()
  create(@Body() createRecipientDto: CreateRecipientDto) {
    return this.recipientsService.create(createRecipientDto);
  }

  @Get()
  findAll() {
    return this.recipientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipientsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecipientDto: UpdateRecipientDto,
  ) {
    return this.recipientsService.update(id, updateRecipientDto);
  }

  // NOVO MÉTODO
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.recipientsService.remove(id);
  }
}