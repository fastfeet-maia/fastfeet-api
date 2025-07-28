import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { Role } from '@prisma/client';

describe('RecipientsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);

    // Limpa o banco e cria um usuário admin para os testes
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.recipient.deleteMany();

    const hashedPassword = await hash('password123', 8);
    adminUser = await prisma.user.create({
      data: {
        name: 'Admin E2E for Recipients',
        cpf: '00000000011',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    // Faz login para obter o token de admin
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf: adminUser.cpf, password: 'password123' });
    adminToken = adminLoginRes.body.access_token;
  });

  it('/recipients (POST) should create a recipient', () => {
    return request(app.getHttpServer())
      .post('/recipients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Doe Recipient',
        street: 'Main Street',
        number: '123',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'MS',
        zipCode: '12345-678',
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual('John Doe Recipient');
      });
  });

  it('/recipients (GET) should list all recipients', async () => {
    // Cria um destinatário primeiro para garantir que a lista não esteja vazia
    await prisma.recipient.create({
      data: {
        name: 'Jane Doe Recipient',
        street: 'Second Street',
        number: '456',
        neighborhood: 'Suburb',
        city: 'Gotham',
        state: 'GS',
        zipCode: '87654-321',
      },
    });

    return request(app.getHttpServer())
      .get('/recipients')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('id');
      });
  });

  it('/recipients/:id (PATCH) should update a recipient', async () => {
    const recipient = await prisma.recipient.create({
      data: {
        name: 'Update Me',
        street: 'Old Street',
        number: '111',
        neighborhood: 'Old Town',
        city: 'Old City',
        state: 'OS',
        zipCode: '11111-111',
      },
    });

    return request(app.getHttpServer())
      .patch(`/recipients/${recipient.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Successfully Updated' })
      .expect(200)
      .then((res) => {
        expect(res.body.id).toEqual(recipient.id);
        expect(res.body.name).toEqual('Successfully Updated');
      });
  });

  it('/recipients/:id (DELETE) should delete a recipient', async () => {
    const recipient = await prisma.recipient.create({
      data: {
        name: 'Delete Me',
        street: 'Final Street',
        number: '999',
        neighborhood: 'End Town',
        city: 'Last City',
        state: 'LS',
        zipCode: '99999-999',
      },
    });

    await request(app.getHttpServer())
      .delete(`/recipients/${recipient.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const deletedRecipient = await prisma.recipient.findUnique({
      where: { id: recipient.id },
    });
    expect(deletedRecipient).toBeNull();
  });

  afterAll(async () => {
    await app.close();
  });
});