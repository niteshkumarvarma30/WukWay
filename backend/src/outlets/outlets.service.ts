import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SEED_OUTLETS = [
  {
    id: 'out-1',
    name: 'Momo House',
    cityZone: 'North Food Court · 2 min walk',
    status: 'OPEN',
    isApproved: true,
    rating: 4.8,
    cuisine: 'Tibetan & Street Food',
    deliveryTime: '2 min walk',
    image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80',
    usp: 'Famous for steaming hot spicy momos · ₹99 Deal',
    owner: { name: 'Rajesh Gurung' },
    menuItems: [
      {
        id: 'menu-101',
        name: 'Steamed Chicken Momos',
        price: 99,
        isVeg: false,
        category: 'Momos',
        isAvailable: true,
        prepTimeMinutes: 5,
        rating: 4.9,
        description: '6 pcs juicy minced chicken dumplings with fiery red garlic chili chutney',
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=300&q=80',
        tag: 'BESTSELLER',
      },
      {
        id: 'menu-102',
        name: 'Crispy Fried Chicken Momos',
        price: 119,
        isVeg: false,
        category: 'Momos',
        isAvailable: true,
        prepTimeMinutes: 7,
        rating: 4.7,
        description: '8 pcs deep-fried golden crispy momos served with creamy mayo dip',
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=300&q=80',
        tag: 'MUST TRY',
      },
      {
        id: 'menu-103',
        name: 'Paneer & Cheese Momos',
        price: 99,
        isVeg: true,
        category: 'Momos',
        isAvailable: true,
        prepTimeMinutes: 6,
        rating: 4.8,
        description: '6 pcs cottage cheese & melted mozzarella with spicy mint dip',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=300&q=80',
        tag: 'VEG SPECIAL',
      },
      {
        id: 'menu-104',
        name: 'Chilli Chicken Street Style',
        price: 149,
        isVeg: false,
        category: 'Sides',
        isAvailable: true,
        prepTimeMinutes: 8,
        rating: 4.6,
        description: 'Wok tossed boneless chicken with bell peppers, green chillies & dark soy',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=300&q=80',
        tag: 'SPICY',
      }
    ]
  },
  {
    id: 'out-2',
    name: 'Roll Corner & Shawarma',
    cityZone: 'Central Plaza · 4 min walk',
    status: 'OPEN',
    isApproved: true,
    rating: 4.7,
    cuisine: 'Kolkata Rolls & Wraps',
    deliveryTime: '4 min walk',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
    usp: 'Double-egg chicken seekh roll · Freshly grilled',
    owner: { name: 'Irfan Sheikh' },
    menuItems: [
      {
        id: 'menu-201',
        name: 'Double Egg Chicken Seekh Roll',
        price: 95,
        isVeg: false,
        category: 'Rolls',
        isAvailable: true,
        prepTimeMinutes: 5,
        rating: 4.9,
        description: 'Flaky paratha layered with 2 eggs, spiced chicken seekh, onion rings & lime',
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=300&q=80',
        tag: 'BESTSELLER',
      },
      {
        id: 'menu-202',
        name: 'Tandoori Paneer Tikka Roll',
        price: 89,
        isVeg: true,
        category: 'Rolls',
        isAvailable: true,
        prepTimeMinutes: 5,
        rating: 4.8,
        description: 'Charcoal grilled cottage cheese chunks wrapped in crispy laccha paratha',
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=300&q=80',
        tag: 'POPULAR',
      },
      {
        id: 'menu-203',
        name: 'Classic Masala Egg Roll',
        price: 59,
        isVeg: false,
        category: 'Rolls',
        isAvailable: true,
        prepTimeMinutes: 4,
        rating: 4.5,
        description: 'Crispy Kolkata egg roll seasoned with black salt & roasted cumin powder',
        image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=300&q=80',
        tag: 'BUDGET',
      }
    ]
  },
  {
    id: 'out-3',
    name: 'Biryani Point & Kebabs',
    cityZone: 'South Lane · 6 min walk',
    status: 'OPEN',
    isApproved: true,
    rating: 4.9,
    cuisine: 'Hyderabadi & Dum Biryani',
    deliveryTime: '6 min walk',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=600&q=80',
    usp: 'Dum pukht biryani with raita & salan · Hot pickup',
    owner: { name: 'Sameer Ahmed' },
    menuItems: [
      {
        id: 'menu-301',
        name: 'Chicken Dum Biryani (Half)',
        price: 129,
        isVeg: false,
        category: 'Biryani',
        isAvailable: true,
        prepTimeMinutes: 4,
        rating: 4.9,
        description: 'Fragrant aged basmati rice cooked on slow charcoal with tender marinated chicken piece',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=300&q=80',
        tag: 'TOP RATED',
      },
      {
        id: 'menu-302',
        name: 'Hyderabadi Egg Biryani',
        price: 99,
        isVeg: false,
        category: 'Biryani',
        isAvailable: true,
        prepTimeMinutes: 3,
        rating: 4.6,
        description: '2 spiced boiled eggs served on rich saffron infused dum biryani rice',
        image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=300&q=80',
        tag: 'POCKET FRIENDLY',
      }
    ]
  },
  {
    id: 'out-4',
    name: 'Chaat Gully & Street Snacks',
    cityZone: 'Library Lane · 3 min walk',
    status: 'OPEN',
    isApproved: true,
    rating: 4.8,
    cuisine: 'Street Chaat & Refreshers',
    deliveryTime: '3 min walk',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    usp: 'Crispy Pani Puri + Dahi Papdi · 1-Tap Pickups',
    owner: { name: 'Kishan Lal' },
    menuItems: [
      {
        id: 'menu-401',
        name: 'Crispy Golgappa / Pani Puri (6 Pcs)',
        price: 49,
        isVeg: true,
        category: 'Chaat',
        isAvailable: true,
        prepTimeMinutes: 2,
        rating: 4.9,
        description: '6 crunchy puris loaded with potato masala and chilled spicy mint-tamarind water',
        image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=300&q=80',
        tag: 'POPULAR',
      },
      {
        id: 'menu-402',
        name: 'Special Dahi Papdi Chaat',
        price: 69,
        isVeg: true,
        category: 'Chaat',
        isAvailable: true,
        prepTimeMinutes: 3,
        rating: 4.8,
        description: 'Crispy papdi with sweet curd, date chutney, spicy sev and pomegranate pearls',
        image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=300&q=80',
        tag: 'CHEF SPECIAL',
      }
    ]
  }
];

@Injectable()
export class OutletsService {
  private fallbackOutlets: any[] = [...SEED_OUTLETS];

  constructor(private prisma: PrismaService) {}

  async findAllOpen() {
    try {
      const outlets = await this.prisma.outlet.findMany({
        where: {
          status: 'OPEN',
          isApproved: true,
        },
        include: {
          owner: { select: { name: true } },
          menuItems: true,
        },
      });
      if (outlets && outlets.length > 0) return outlets;
    } catch (e) {
      // fallback to pre-seeded outlets
    }
    return this.fallbackOutlets.filter(o => o.status === 'OPEN' && o.isApproved);
  }

  async getMenu(outletId: string) {
    try {
      const items = await this.prisma.menuItem.findMany({
        where: {
          outletId: outletId,
          isAvailable: true,
        },
      });
      if (items && items.length > 0) return items;
    } catch (e) {
      // fallback
    }

    const fallbackOutlet = this.fallbackOutlets.find(o => o.id === outletId);
    if (fallbackOutlet) {
      return fallbackOutlet.menuItems || [];
    }

    // Default generic items if not found
    return this.fallbackOutlets[0].menuItems;
  }

  async findAllAdmin() {
    try {
      const outlets = await this.prisma.outlet.findMany({
        include: {
          owner: true,
          menuItems: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (outlets && outlets.length > 0) return outlets;
    } catch (e) {
      // fallback
    }
    return this.fallbackOutlets;
  }

  async createOutlet(data: any) {
    try {
      return await this.prisma.outlet.create({
        data: {
          name: data.name,
          cityZone: data.cityZone,
          ownerId: data.ownerId,
          ...(data.isApproved !== undefined && { isApproved: data.isApproved }),
          ...(data.status !== undefined && { status: data.status }),
        },
      });
    } catch (e) {
      const newOutlet = {
        id: `out-${Date.now()}`,
        name: data.name,
        cityZone: data.cityZone || 'Campus Zone',
        ownerId: data.ownerId,
        status: data.status || 'CLOSED',
        isApproved: data.isApproved || false,
        owner: { name: data.ownerName || 'Vendor' },
        menuItems: [],
        rating: 4.5,
        cuisine: 'Quick Bites',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
      };
      this.fallbackOutlets.unshift(newOutlet);
      return newOutlet;
    }
  }

  async findByVendor(ownerId: string) {
    try {
      const outlet = await this.prisma.outlet.findFirst({
        where: { ownerId },
        include: { menuItems: true },
      });
      if (outlet) return outlet;
    } catch (e) {
      // fallback
    }
    const found = this.fallbackOutlets.find(o => (o as any).ownerId === ownerId);
    return found || null;
  }


  async approveOutlet(id: string) {
    const mem = this.fallbackOutlets.find(o => o.id === id);
    if (mem) {
      mem.isApproved = true;
      mem.status = 'OPEN';
    }

    try {
      return await this.prisma.outlet.update({
        where: { id },
        data: { isApproved: true, status: 'OPEN' },
      });
    } catch (e) {
      return mem || { id, isApproved: true, status: 'OPEN' };
    }
  }

  async createMenuItem(outletId: string, data: any) {
    try {
      return await this.prisma.menuItem.create({
        data: {
          name: data.name,
          price: data.price,
          outletId,
        },
      });
    } catch (e) {
      const newItem = {
        id: `item-${Date.now()}`,
        name: data.name,
        price: parseFloat(data.price),
        isAvailable: true,
        isVeg: data.isVeg ?? true,
        description: data.description || 'Freshly made to order',
        category: data.category || 'Special',
        image: data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
        rating: 4.8,
        prepTimeMinutes: 5,
      };
      const outlet = this.fallbackOutlets.find(o => o.id === outletId);
      if (outlet) {
        outlet.menuItems.push(newItem as any);
      }
      return newItem;
    }
  }

  async updateStatus(outletId: string, status: string) {
    const mem = this.fallbackOutlets.find(o => o.id === outletId);
    if (mem) {
      mem.status = status;
    }

    try {
      return await this.prisma.outlet.update({
        where: { id: outletId },
        data: { status },
      });
    } catch (e) {
      return mem || { id: outletId, status };
    }
  }

  clearCustom() {
    this.fallbackOutlets = this.fallbackOutlets.filter(o => ['out-1', 'out-2', 'out-3'].includes(o.id));
  }
}


