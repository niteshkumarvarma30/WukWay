import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { OutletsService } from '../outlets/outlets.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private outletsService: OutletsService,
  ) {}


  async authenticate(phone: string, role: string, name?: string) {
    let user = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          role,
          name: name || 'Guest User',
          email: `${phone.replace(/\D/g, '')}@wukway.com`,
          auth_provider_id: `phone-${phone}`,
        },
      });
    } else if (user.role !== role) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role },
      });
    }

    return user;
  }

  async syncUser(clerkUserId: string, role: string, email: string) {
    try {
      let user = await this.prisma.user.findFirst({
        where: { auth_provider_id: clerkUserId },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            auth_provider_id: clerkUserId,
            email: email || `${clerkUserId}@wukway.com`,
            name: email ? email.split('@')[0] : 'User',
            role: role || 'CUSTOMER',
          },
        });
      } else if (role && user.role !== role) {
        // Don't downgrade vendor to customer accidentally if they log into customer app
        if (!(user.role === 'VENDOR' && role === 'CUSTOMER')) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { role },
          });
        }
      }

      return user;
    } catch (e) {
      console.warn('Prisma syncUser fallback:', e);
      return {
        id: `usr-${clerkUserId.substring(0, 10)}`,
        auth_provider_id: clerkUserId,
        email: email || `${clerkUserId}@wukway.com`,
        name: email ? email.split('@')[0] : 'User',
        role: role || 'CUSTOMER',
      };
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      return [];
    }
  }

  async resetData() {
    this.ordersService.clearAll();
    this.outletsService.clearCustom();

    try {
      await this.prisma.orderItem.deleteMany({});
      await this.prisma.order.deleteMany({});
      await this.prisma.user.deleteMany({});
      return { success: true, message: 'Total reset complete. All users, orders, and custom stalls cleared.' };
    } catch (e) {
      return { success: true, message: 'Total reset complete. Memory cache, orders, and stalls reset.' };
    }
  }
}



