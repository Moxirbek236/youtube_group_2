import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WatchHistorysService } from './watch-historys.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { UpdateWatchHistoryDto } from './dto/update-watch-history.dto';

@Controller('watch-historys')
export class WatchHistorysController {
  constructor(private readonly watchHistorysService: WatchHistorysService) {}

  @Post()
  create(@Body() createWatchHistoryDto: CreateWatchHistoryDto) {
    return this.watchHistorysService.create(createWatchHistoryDto);
  }

  @Get()
  findAll() {
    return this.watchHistorysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.watchHistorysService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWatchHistoryDto: UpdateWatchHistoryDto) {
    return this.watchHistorysService.update(+id, updateWatchHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.watchHistorysService.remove(+id);
  }
}
