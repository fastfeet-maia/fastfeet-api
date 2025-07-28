import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { Role, User, Recipient } from '@prisma/client';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let deliveryman: User;
  let recipient: Recipient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);

    // Limpa o banco e cria dados de pré-requisito
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.recipient.deleteMany();

    const hashedPassword = await hash('password123', 8);
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin E2E for Orders',
        cpf: '00000000022',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    deliveryman = await prisma.user.create({
      data: {
        name: 'Deliveryman for Orders',
        cpf: '11111111122',
        password: hashedPassword,
        role: Role.DELIVERYMAN,
      },
    });

    recipient = await prisma.recipient.create({
      data: {
        name: 'Recipient for Orders',
        street: 'Order Street',
        number: '123',
        neighborhood: 'Order Town',
        city: 'Order City',
        state: 'OS',
        zipCode: '12312-312',
      },
    });

    // Faz login como admin para obter o token
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf: adminUser.cpf, password: 'password123' });
    adminToken = adminLoginRes.body.access_token;
  });

  it('/orders (POST) should create an order', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        recipientId: recipient.id,
        deliverymanId: deliveryman.id,
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.recipientId).toEqual(recipient.id);
      });
  });

  it('/orders (GET) should list all orders', async () => {
    return request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/orders/:id (GET) should get a specific order', async () => {
    const order = await prisma.order.create({
      data: {
        recipientId: recipient.id,
        deliverymanId: deliveryman.id,
      },
    });

    return request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body.id).toEqual(order.id);
        expect(res.body.recipient.name).toEqual(recipient.name);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});