import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

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
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 8);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findByCpf(cpf: string) {
  return this.prisma.user.findUnique({
    where: {
      cpf,
    },
  });
  }
}