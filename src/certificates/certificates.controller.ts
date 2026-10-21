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
import { CertificatesService } from './certificates.service.js';
import { CreateCertificateDto } from './dto/create-certificate.dto.js';
import { UpdateCertificateDto } from './dto/update-certificate.dto.js';
import { PublishCertificateDto } from './dto/publish-certificate.dto.js';

@ApiBearerAuth('bearerAuth')
@ApiTags('Certificates')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
@ApiForbiddenResponse({ description: 'Approved account required' })
@UseGuards(ApprovedUserGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a certificate (draft)' })
  @ApiCreatedResponse({ description: 'Certificate created' })
  @ApiBadRequestResponse({ description: 'Missing file/logo, invalid media or dates' })
  // Create a new draft certificate.
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateCertificateDto) {
    return this.certificatesService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your certificates' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiOkResponse({ description: 'Paginated list of your certificates' })
  // List your own certificates.
  findAll(
    @CurrentUser() user: CurrentUserType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.certificatesService.findAll(user, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of your certificates' })
  @ApiOkResponse({ description: 'Certificate' })
  @ApiNotFoundResponse({ description: 'Certificate not found' })
  // Get one of your certificates.
  findOne(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.certificatesService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of your certificates' })
  @ApiOkResponse({ description: 'Certificate updated' })
  @ApiBadRequestResponse({ description: 'Would leave no file/logo, invalid media or dates' })
  @ApiNotFoundResponse({ description: 'Certificate not found' })
  // Update a certificate.
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateCertificateDto,
  ) {
    return this.certificatesService.update(user, id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish or unpublish one of your certificates' })
  @ApiOkResponse({ description: 'Publish state updated' })
  @ApiNotFoundResponse({ description: 'Certificate not found' })
  // Turn publishing on or off.
  setPublished(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: PublishCertificateDto,
  ) {
    return this.certificatesService.setPublished(user, id, dto.isPublished);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one of your certificates' })
  @ApiOkResponse({ description: 'Certificate deleted' })
  @ApiNotFoundResponse({ description: 'Certificate not found' })
  // Delete a certificate.
  remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.certificatesService.remove(user, id);
  }
}
