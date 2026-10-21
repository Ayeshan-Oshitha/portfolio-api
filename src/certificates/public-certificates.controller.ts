import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { CertificateType } from '../generated/prisma/enums.js';
import { CertificatesService } from './certificates.service.js';

@AllowAnonymous()
@ApiTags('Public certificates')
@Controller('public/certificates')
export class PublicCertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'List published certificates (featured first)' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 50, default: 12 },
  })
  @ApiQuery({ name: 'type', required: false, enum: CertificateType })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiOkResponse({ description: 'Paginated published certificates' })
  // Get published certificates, featured first, optionally by type.
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('type', new ParseEnumPipe(CertificateType, { optional: true })) type?: CertificateType,
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
  ) {
    return this.certificatesService.findPublished(page, limit, type, featured);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a published certificate' })
  @ApiOkResponse({ description: 'Published certificate' })
  @ApiNotFoundResponse({ description: 'Certificate not found or not published' })
  // Get one published certificate.
  findOne(@Param('id') id: string) {
    return this.certificatesService.findPublishedOne(id);
  }
}
