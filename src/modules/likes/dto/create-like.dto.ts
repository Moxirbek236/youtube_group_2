import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LikeType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({ enum: LikeType, example: LikeType.LIKE })
  @IsEnum(LikeType)
  @IsNotEmpty()
  type: LikeType;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  videoId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  commentId?: number;
}