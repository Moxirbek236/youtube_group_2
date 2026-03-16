import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VideoStatus, Visibility } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ example: 'My Awesome Video' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'This is a great video about NestJS' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ example: 'https://example.com/video.mp4' })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiProperty({ example: 320 })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ enum: Visibility, default: Visibility.PUBLIC })
  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;

  @ApiPropertyOptional({ enum: VideoStatus, default: VideoStatus.PUBLISHED })
  @IsEnum(VideoStatus)
  @IsOptional()
  status?: VideoStatus;
}

