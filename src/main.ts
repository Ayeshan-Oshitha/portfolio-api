import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import type { Env } from './config/env.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('Portfolio API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        description: 'Session token returned by Better Auth login',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  app.use(
    '/api/docs',
    apiReference({
      theme: 'default',
      darkMode: true,
      sources: [
        {
          title: 'Portfolio Backend API',
          slug: 'portfolio-backend-api',
          content: document,
        },
        {
          title: 'Authentication',
          slug: 'auth',
          url: '/api/auth/open-api/generate-schema',
        },
      ],
    }),
  );

  const config = app.get<ConfigService<Env, true>>(ConfigService);

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
await bootstrap();
