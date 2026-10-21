import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength } from 'class-validator';
import { CreateArticleDto } from './create-article.dto.js';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @ApiPropertyOptional({
    example: 'building-a-cms-with-nestjs',
    description:
      'Change the URL slug on purpose (e.g. to fix a typo). Title changes never change it.',
  })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(120)
  slug?: string;
}
