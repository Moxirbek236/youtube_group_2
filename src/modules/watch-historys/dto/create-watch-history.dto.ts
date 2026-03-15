import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateWatchHistoryDto {
  @ApiPropertyOptional({ example: 125, description: 'seconds watched' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  watchTime?: number;

  @ApiPropertyOptional({ example: '720p' })
  @IsString()
  @IsOptional()
  quality?: string;

  @ApiPropertyOptional({ example: 'mobile' })
  @IsString()
  @IsOptional()
  device?: string;

  @ApiPropertyOptional({ example: 'UZ' })
  @IsString()
  @IsOptional()
  location?: string;
}
