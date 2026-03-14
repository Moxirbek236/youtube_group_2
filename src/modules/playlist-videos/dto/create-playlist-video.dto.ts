import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlaylistVideoDto {
  @ApiProperty({ example: '1' })
  @IsNumber()
  @IsNotEmpty()
  videoId: number;

  @ApiProperty({ example: '1' })
  @IsNumber()
  @IsNotEmpty()
  position: number;
}