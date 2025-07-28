import { Test, TestingModule } from '@nestjs/testing';
import { RecipientsController } from './recipients.controller';
import { RecipientsService } from './recipients.service';

describe('RecipientsController', () => {
  let controller: RecipientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipientsController],
      providers: [{ provide: RecipientsService, useValue: {} }],
    }).compile();

    controller = module.get<RecipientsController>(RecipientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});