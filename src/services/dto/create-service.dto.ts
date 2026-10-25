import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Full-Stack Web Development' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Fast, modern web apps built with React and NestJS.' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  description!: string;

  @ApiPropertyOptional({ description: 'Details in Markdown (e.g. a list of what is included)' })
  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  content?: string;

  @ApiPropertyOptional({ description: 'Icon media ID from your library' })
  @IsOptional()
  @IsString()
  iconMediaId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Technology tag IDs (max 20)' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  tagIds?: string[];

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
