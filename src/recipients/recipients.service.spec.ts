import { Test, TestingModule } from '@nestjs/testing';
import { RecipientsService } from './recipients.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RecipientsService', () => {
  let service: RecipientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipientsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<RecipientsService>(RecipientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});