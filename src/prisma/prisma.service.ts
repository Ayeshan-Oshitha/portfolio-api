import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Env } from '../config/env.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL', { infer: true }),
      // Drop idle connections before Neon's pooler does, so we never reuse a dead one.
      idleTimeoutMillis: 60_000,
    });
    super({
      adapter,
      // Neon's free plan sleeps when idle and takes a few seconds to wake. The default 2 s wait
      // to start a transaction is too short for that (Prisma error P2028), so allow longer.
      transactionOptions: { maxWait: 15_000, timeout: 20_000 },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
