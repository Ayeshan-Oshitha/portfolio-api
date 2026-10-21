import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishCertificateDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isPublished!: boolean;
}
