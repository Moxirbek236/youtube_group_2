import { IsOptional, IsString, IsInt } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateVideoDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({ type: "string", format: "binary" })
  thumbnail?: string;
}