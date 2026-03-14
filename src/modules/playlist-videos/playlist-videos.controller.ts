import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PlaylistVideosService } from './playlist-videos.service';
import { CreatePlaylistVideoDto } from './dto/create-playlist-video.dto';
import { UpdatePlaylistVideoDto } from './dto/update-playlist-video.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { Role } from '@prisma/client';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePlaylistDto } from '../playlists/dto/create-playlist.dto';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistVideosController {
  constructor(private readonly playlistVideosService: PlaylistVideosService) {}

  @Post(":id/video")
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  @ApiBody({ type: CreatePlaylistDto })
  createVideo(@Body() CreatePlaylistVideoDto: CreatePlaylistVideoDto, @Req() req: any, @Param('id') playlistId : number) {
    return this.playlistVideosService.create(CreatePlaylistVideoDto, req['user'].id, playlistId);
  }


  @Get()
  findAll() {
    return this.playlistVideosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistVideosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaylistVideoDto: UpdatePlaylistVideoDto) {
    return this.playlistVideosService.update(+id, updatePlaylistVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistVideosService.remove(+id);
  }
}
