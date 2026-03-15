import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorators';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/checkRole.guard';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { PaginationDto } from './entities/watch-history.entity';
import { WatchHistorysService } from './watch-historys.service';

@ApiTags('watch-history')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('token')
@Controller()
export class WatchHistorysController {
  constructor(private readonly watchHistorysService: WatchHistorysService) {}

  @Post('videos/:id/view')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  @ApiBody({ type: CreateWatchHistoryDto })
  create(
    @Param('id', ParseIntPipe) videoId: number,
    @Body() createWatchHistoryDto: CreateWatchHistoryDto,
    @Req() req: any,
  ) {
    return this.watchHistorysService.recordView(
      videoId,
      req['user'].id,
      createWatchHistoryDto,
    );
  }

  @Get('users/me/history')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findAll(@Req() req: any, @Query() query?: PaginationDto) {
    return this.watchHistorysService.findAll(req['user'].id, query);
  }

  @Delete('users/me/history')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  remove(@Req() req: any) {
    return this.watchHistorysService.clear(req['user'].id);
  }
}
