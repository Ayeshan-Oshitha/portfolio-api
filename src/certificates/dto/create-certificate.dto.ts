import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CertificateType } from '../../generated/prisma/enums.js';

export class CreateCertificateDto {
  @ApiProperty({ example: 'AWS Certified Developer – Associate' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ enum: CertificateType, example: CertificateType.EXAM })
  @IsEnum(CertificateType)
  type!: CertificateType;

  @ApiProperty({ example: 'Amazon Web Services' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  issuer!: string;

  @ApiPropertyOptional({
    description: 'Certificate image or PDF (media ID). File or logo is required.',
  })
  @IsOptional()
  @IsString()
  fileMediaId?: string;

  @ApiPropertyOptional({ description: 'Issuer logo (media ID). File or logo is required.' })
  @IsOptional()
  @IsString()
  issuerLogoMediaId?: string;

  @ApiPropertyOptional({ example: '2026-05-10' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({ example: '2029-05-10' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ example: 'ABC123XYZ' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  credentialId?: string;

  @ApiPropertyOptional({ example: 'https://www.credly.com/badges/...' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  credentialUrl?: string;

  @ApiPropertyOptional({ description: 'Short description in Markdown' })
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  description?: string;

  @ApiPropertyOptional({ default: false, description: 'Show on the homepage' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Lower numbers show first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder?: number;
}
