import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // A correção está aqui:
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with a hashed password', async () => {
      const createUserDto = {
        name: 'Test User',
        cpf: '12345678900',
        password: 'password123',
      };
      const expectedUser = {
        id: 'some-id',
        ...createUserDto,
        role: Role.DELIVERYMAN,
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.name).toEqual(createUserDto.name);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw a ConflictException if CPF already exists', async () => {
      const createUserDto = {
        name: 'Test User',
        cpf: '12345678900',
        password: 'password123',
      };
      prismaMock.user.findUnique.mockResolvedValue({ id: 'some-id' });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user without the password', async () => {
      const mockUser = {
        id: 'some-id',
        name: 'Test User',
        cpf: '12345678900',
        password: 'hashedpassword',
        role: Role.DELIVERYMAN,
      };
      prismaMock.user.findUniqueOrThrow.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user is not found', async () => {
      prismaMock.user.findUniqueOrThrow.mockRejectedValue(new Error());

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});