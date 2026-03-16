import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ example: 'My Playlist' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'This is my playlist description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: Visibility, default: Visibility.PUBLIC })
  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}