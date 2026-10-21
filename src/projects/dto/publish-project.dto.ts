import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishProjectDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isPublished!: boolean;
}
