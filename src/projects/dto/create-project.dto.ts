import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProjectImageInputDto {
  @ApiProperty({ description: 'Media ID from your library' })
  @IsString()
  mediaId!: string;

  @ApiPropertyOptional({ example: 'Dashboard screen' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Portfolio CMS' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Personal portfolio with a headless CMS.' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;

  @ApiPropertyOptional({ description: 'Full description in Markdown' })
  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://myportfolio.dev' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  liveUrl?: string;

  @ApiPropertyOptional({ example: 'https://github.com/me/portfolio' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  repoUrl?: string;

  @ApiPropertyOptional({ example: '2026-10-16' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-24', description: 'Leave empty if ongoing' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Lower numbers show first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Cover image media ID' })
  @IsOptional()
  @IsString()
  coverMediaId?: string;

  @ApiPropertyOptional({
    type: [ProjectImageInputDto],
    description: 'Gallery in display order (max 20)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProjectImageInputDto)
  images?: ProjectImageInputDto[];

  @ApiPropertyOptional({ type: [String], description: 'Tag IDs (max 20)' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  tagIds?: string[];
}
