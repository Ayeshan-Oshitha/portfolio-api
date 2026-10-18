import 'reflect-metadata';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { createAuth } from './src/auth/auth.js';
import { validateEnv, type Env } from './src/config/env.js';
import { PrismaService } from './src/prisma/prisma.service.js';

const env = validateEnv(process.env);
const config = new ConfigService<Env, true>(env);
const prisma = new PrismaService(config);

export const auth = createAuth(config, prisma);
