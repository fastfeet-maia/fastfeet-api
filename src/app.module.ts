import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RecipientsModule } from './recipients/recipients.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [PrismaModule, UsersModule, RecipientsModule, OrdersModule], // Importa os módulos aqui
  controllers: [AppController],
  providers: [AppService], // Removemos o PrismaService daqui
})
export class AppModule {}