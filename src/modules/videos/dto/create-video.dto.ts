import { IsString, IsOptional, IsInt } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateVideoDto {

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsInt()
  duration: number;

  @ApiPropertyOptional({ type: "string", format: "binary" })
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ type: "string", format: "binary" })
  videoUrl: string;
}