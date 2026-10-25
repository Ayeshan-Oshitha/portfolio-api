import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ArticleCategory } from '../../generated/prisma/enums.js';

export class CreateArticleDto {
  @ApiProperty({ example: 'Building a CMS with NestJS' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    example: 'How I built my portfolio backend…',
    description: '2–3 line preview in Markdown (shown on the card)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Full body in Markdown (optional when using externalUrl)' })
  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  content?: string;

  @ApiPropertyOptional({ example: 'https://medium.com/@oshitha/my-article-123abc' })
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(500)
  externalUrl?: string;

  @ApiPropertyOptional({ description: 'ID of a cover image from your media library' })
  @IsOptional()
  @IsString()
  coverMediaId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Tag IDs (max 20)' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ enum: ArticleCategory, default: ArticleCategory.TECH })
  @IsOptional()
  @IsEnum(ArticleCategory)
  category?: ArticleCategory;

  @ApiPropertyOptional({ default: false, description: 'Show on the homepage' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
