import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PlaylistVideosService } from './playlist-videos.service';
import { CreatePlaylistVideoDto } from './dto/create-playlist-video.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/checkRole.guard';

@ApiTags('playlists')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('token')
@Controller('playlists')
export class PlaylistVideosController {
  constructor(private readonly playlistVideosService: PlaylistVideosService) {}

  @Post(':id/videos')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  @ApiBody({ type: CreatePlaylistVideoDto })
  createVideo(
    @Body() createPlaylistVideoDto: CreatePlaylistVideoDto,
    @Req() req: any,
    @Param('id', ParseIntPipe) playlistId: number,
  ) {
    return this.playlistVideosService.create(
      createPlaylistVideoDto,
      req['user'].id,
      playlistId,
    );
  }

  @Get(':id/videos')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findAll(@Param('id', ParseIntPipe) playlistId: number, @Req() req: any) {
    return this.playlistVideosService.findAll(playlistId, req['user'].id);
  }

  @Delete(':id/videos/:videoId')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  remove(
    @Param('id', ParseIntPipe) playlistId: number,
    @Param('videoId', ParseIntPipe) videoId: number,
    @Req() req: any,
  ) {
    return this.playlistVideosService.remove(playlistId, videoId, req['user'].id);
  }
}
