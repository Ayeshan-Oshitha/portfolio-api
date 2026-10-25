import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApprovedUserGuard,
  type CurrentUser as CurrentUserType,
} from '../auth/approved-user.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ServicesService } from './services.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { PublishServiceDto } from './dto/publish-service.dto.js';

@ApiBearerAuth('bearerAuth')
@ApiTags('Services')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
@ApiForbiddenResponse({ description: 'Approved account required' })
@UseGuards(ApprovedUserGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service (draft)' })
  @ApiCreatedResponse({ description: 'Service created' })
  @ApiBadRequestResponse({ description: 'Invalid body, icon or technologies' })
  // Create a new draft service.
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your services' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiOkResponse({ description: 'Paginated list of your services' })
  // List your own services.
  findAll(
    @CurrentUser() user: CurrentUserType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.servicesService.findAll(user, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of your services' })
  @ApiOkResponse({ description: 'Service' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  // Get one of your services.
  findOne(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.servicesService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of your services' })
  @ApiOkResponse({ description: 'Service updated' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  // Update a service; sending tagIds replaces its technologies.
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(user, id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish or unpublish one of your services' })
  @ApiOkResponse({ description: 'Publish state updated' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  // Turn publishing on or off.
  setPublished(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: PublishServiceDto,
  ) {
    return this.servicesService.setPublished(user, id, dto.isPublished);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one of your services' })
  @ApiOkResponse({ description: 'Service deleted' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  // Delete a service.
  remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.servicesService.remove(user, id);
  }
}
