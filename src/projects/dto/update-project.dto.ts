import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength } from 'class-validator';
import { CreateProjectDto } from './create-project.dto.js';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({
    example: 'portfolio-cms',
    description: 'Change the URL slug on purpose. Title changes never change it.',
  })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(120)
  slug?: string;
}
