import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishArticleDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isPublished!: boolean;
}
