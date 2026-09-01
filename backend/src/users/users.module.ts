import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { OrdersModule } from '../orders/orders.module';
import { OutletsModule } from '../outlets/outlets.module';

@Module({
  imports: [OrdersModule, OutletsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

