import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishServiceDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isPublished!: boolean;
}
