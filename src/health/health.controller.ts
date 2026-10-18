import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@AllowAnonymous()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check application and database health' })
  @ApiOkResponse({
    description: 'Application and database are available',
    schema: {
      type: 'object',
      required: ['status', 'db', 'timestamp'],
      properties: {
        status: { type: 'string', example: 'ok' },
        db: { type: 'string', example: 'connected' },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2026-10-18T06:00:00.000Z',
        },
      },
    },
  })
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
