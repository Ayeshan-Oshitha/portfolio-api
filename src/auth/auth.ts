import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, bearer, openAPI } from 'better-auth/plugins';
import type { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import type { PrismaService } from '../prisma/prisma.service.js';

export function createAuth(config: ConfigService<Env, true>, prisma: PrismaService) {
  return betterAuth({
    appName: 'Portfolio API',
    secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
    baseURL: config.get('BETTER_AUTH_URL', { infer: true }),
    basePath: '/api/auth',

    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),

    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
    },

    user: {
      additionalFields: {
        approvalStatus: {
          type: ['PENDING', 'APPROVED', 'REJECTED'],
          defaultValue: 'PENDING',
          input: false,
        },
      },
    },

    plugins: [
      admin({
        defaultRole: 'user',
        adminRoles: ['admin'],
      }),
      bearer(),
      openAPI({
        disableDefaultReference: true,
      }),
    ],
  });
}
