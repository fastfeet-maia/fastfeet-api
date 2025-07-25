import {
  ConflictException,
  Injectable,
  NotFoundException, // Importa o NotFoundException
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, cpf, password } = createUserDto;

    const userWithSameCpf = await this.prisma.user.findUnique({
      where: { cpf },
    });

    if (userWithSameCpf) {
      throw new ConflictException('CPF já cadastrado.');
    }

    const hashedPassword = await hash(password, 8);

    const user = await this.prisma.user.create({
      data: {
        name,
        cpf,
        password: hashedPassword,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();

    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      // Captura o erro do Prisma e lança uma exceção HTTP padrão do NestJS
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
  }
  async remove(id: string) {
    // Garante que o usuário existe antes de tentar deletar
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }
}