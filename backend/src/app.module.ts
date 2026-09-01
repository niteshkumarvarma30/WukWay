import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { OutletsModule } from './outlets/outlets.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [PrismaModule, UsersModule, OutletsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
