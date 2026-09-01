import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      if (process.env.DATABASE_URL) {
        await this.$connect();
        console.log('✅ PostgreSQL connected via Prisma');
      } else {
        console.log('⚡ DATABASE_URL not set - running with in-memory fallback');
      }
    } catch (e) {
      console.warn('⚠️ Prisma connection failed, running with in-memory store:', e);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      await this.pool.end();
    } catch (e) {
      // ignore
    }
  }

}
