import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { Role } from '@prisma/client';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);

    // Limpa o banco e cria um usuário para o teste de login
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.recipient.deleteMany();

    const hashedPassword = await hash('password123', 8);
    await prisma.user.create({
      data: {
        name: 'Login Test User',
        cpf: '12312312312',
        password: hashedPassword,
        role: Role.DELIVERYMAN,
      },
    });
  });

  it('/auth/login (POST) should return an access token with correct credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        cpf: '12312312312',
        password: 'password123',
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  it('/auth/login (POST) should return 401 with incorrect password', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        cpf: '12312312312',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});