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
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import { UsersModule } from './users/users.module.js';
import { StorageModule } from './storage/storage.module.js';
import { MediaModule } from './media/media.module.js';
import { TagsModule } from './tags/tags.module.js';
import { ArticlesModule } from './articles/articles.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { CertificatesModule } from './certificates/certificates.module.js';

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
    UsersModule,
    StorageModule,
    MediaModule,
    TagsModule,
    ArticlesModule,
    ProjectsModule,
    CertificatesModule,
  ],
  controllers: [HealthController, AccessController],
  providers: [
    ApprovedUserGuard,
    AdminGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class AppModule {}
