import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RecipientsModule } from './recipients/recipients.module';

@Module({
  imports: [PrismaModule, UsersModule, RecipientsModule], // Importa os módulos aqui
  controllers: [AppController],
  providers: [AppService], // Removemos o PrismaService daqui
})
export class AppModule {}