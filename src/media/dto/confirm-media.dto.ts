import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ConfirmMediaDto {
  @ApiProperty({ example: 'users/abc123/2f1c...e9.png' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  key!: string;

  @ApiProperty({ example: 'cover.png' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  originalName!: string;
}
