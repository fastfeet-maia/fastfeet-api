import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { Role } from '@prisma/client';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let deliverymanToken: string;
  let adminUser: any;
  let deliverymanUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);

    // Limpa o banco e cria usuários de teste
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await hash('password123', 8);
    adminUser = await prisma.user.create({
      data: {
        name: 'Admin E2E',
        cpf: '00000000000',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    deliverymanUser = await prisma.user.create({
      data: {
        name: 'Deliveryman E2E',
        cpf: '11111111111',
        password: hashedPassword,
        role: Role.DELIVERYMAN,
      },
    });

    // Faz login para obter os tokens
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf: adminUser.cpf, password: 'password123' });
    adminToken = adminLoginRes.body.access_token;

    const deliverymanLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf: deliverymanUser.cpf, password: 'password123' });
    deliverymanToken = deliverymanLoginRes.body.access_token;
  });

  it('/users (GET) should be protected for admins', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('/users (GET) should fail for non-admins', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${deliverymanToken}`)
      .expect(403); // Forbidden
  });

  it('/users/:id (GET) should return a single user for an admin', () => {
    return request(app.getHttpServer())
      .get(`/users/${deliverymanUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body.id).toEqual(deliverymanUser.id);
        expect(res.body).not.toHaveProperty('password');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});