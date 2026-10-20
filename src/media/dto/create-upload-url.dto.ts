import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { MEDIA_CONTENT_TYPES, type MediaContentType } from '../media.constants.js';

export class CreateUploadUrlDto {
  @ApiProperty({ enum: MEDIA_CONTENT_TYPES, example: 'image/png' })
  @IsIn(MEDIA_CONTENT_TYPES)
  contentType!: MediaContentType;

  @ApiProperty({ example: 'cover.png' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fileName!: string;
}
