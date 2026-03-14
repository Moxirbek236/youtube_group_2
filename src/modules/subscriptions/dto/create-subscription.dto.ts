import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {

  @ApiProperty({
    example: true,
    description: 'Enable notifications for this subscription',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
  
}