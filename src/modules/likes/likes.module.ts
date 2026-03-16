import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports:[NotificationModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
