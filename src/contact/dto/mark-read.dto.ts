import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class MarkReadDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isRead!: boolean;
}
