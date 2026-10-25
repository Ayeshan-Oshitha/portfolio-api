import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ServicesService } from './services.service.js';

@AllowAnonymous()
@ApiTags('Public services')
@Controller('public/services')
export class PublicServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List published services (featured first)' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'tag', required: false, description: 'Technology tag slug, e.g. react' })
  @ApiOkResponse({ description: 'Published services with content and technologies' })
  // Get published services, featured first.
  findAll(
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
    @Query('tag') tag?: string,
  ) {
    return this.servicesService.findPublished(featured, tag);
  }
}
