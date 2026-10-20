import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'React' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: 'react', description: 'Lowercase letters, numbers and dashes' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(50)
  slug!: string;

  @ApiPropertyOptional({ example: 'react', description: 'Simple Icons slug' })
  @IsOptional()
  @Matches(/^[a-z0-9]+$/)
  @MaxLength(50)
  iconSlug?: string;

  @ApiPropertyOptional({ example: '61DAFB', description: 'Hex color without #' })
  @IsOptional()
  @Matches(/^[0-9A-Fa-f]{6}$/)
  color?: string;

  @ApiPropertyOptional({ description: 'ID of an uploaded icon in your media library' })
  @IsOptional()
  @IsString()
  iconMediaId?: string;
}
