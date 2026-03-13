import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubscriptionDto {

  @ApiPropertyOptional({
    example: false,
    description: 'Toggle notifications',
  })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

}