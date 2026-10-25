import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Kamal Perera' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'kamal@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiPropertyOptional({ example: 'Project inquiry' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  subject?: string;

  @ApiProperty({ example: 'Hi, can we work together on a web app?' })
  @IsString()
  @MinLength(10)
  @MaxLength(5_000)
  message!: string;

  @ApiPropertyOptional({ description: 'Leave empty. Hidden anti-spam field.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
