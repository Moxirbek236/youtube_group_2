import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class PaginationDto {

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number'
  })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page'
  })
  @IsOptional()
  @IsNumberString()
  limit?: number;

}