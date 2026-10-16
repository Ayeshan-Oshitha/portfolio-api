import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Neon Postgres connection string
  DATABASE_URL: z.string().startsWith('postgres').describe('Neon Postgres connection string'), // pooled - used by the app
  DIRECT_URL: z.string().startsWith('postgres').describe('Neon Postgres connection string'), // direct - used by Prisma migrations
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error('Invalid environment variables:\n' + z.prettifyError(result.error));
    throw new Error('Invalid environment variables');
  }
  return result.data;
}
