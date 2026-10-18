import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv, type Env } from './config/env.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './auth/auth.js';
import { AccessController } from './auth/access.controller.js';
import { ApprovedUserGuard } from './auth/approved-user.guard.js';
import { AdminGuard } from './auth/admin.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // inject ConfigService anywhere without importing the module
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule.forRootAsync({
      imports: [PrismaModule],
      inject: [ConfigService, PrismaService],
      useFactory: (config: ConfigService<Env, true>, prisma: PrismaService) => ({
        auth: createAuth(config, prisma),
      }),
    }),
  ],
  controllers: [HealthController, AccessController],
  providers: [ApprovedUserGuard, AdminGuard],
})
export class AppModule {}
