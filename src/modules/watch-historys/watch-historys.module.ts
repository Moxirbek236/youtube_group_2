import { Module } from '@nestjs/common';
import { WatchHistorysService } from './watch-historys.service';
import { WatchHistorysController } from './watch-historys.controller';

@Module({
  controllers: [WatchHistorysController],
  providers: [WatchHistorysService],
})
export class WatchHistorysModule {}
