import { Module } from '@nestjs/common';
import { PlaylistVideosService } from './playlist-videos.service';
import { PlaylistVideosController } from './playlist-videos.controller';

@Module({
  controllers: [PlaylistVideosController],
  providers: [PlaylistVideosService],
})
export class PlaylistVideosModule {}
