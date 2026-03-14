import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/checkRole.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorators';
import { PaginationDto } from './entities/playlist.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('playlists')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('token')
@Controller()
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post('playlists')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  @ApiBody({ type: CreatePlaylistDto })
  create(@Body() createPlaylistDto: CreatePlaylistDto, @Req() req: any) {
    return this.playlistsService.create(createPlaylistDto, req['user'].id);
  }

  @Get('users/:userId')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findAll(
    @Param('userId', new ParseIntPipe()) userId,
    @Query() query?: PaginationDto,
  ) {
    return this.playlistsService.findAll(userId, query);
  }

  @Get('playlists/me')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findAllMe(@Req() req: any, @Query() query?: PaginationDto) {
    return this.playlistsService.findAll(req['user'].id, query);
  }

  @Get('playlists/:id')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findOne(@Param('id') id: number, @Req() req: any) {
    return this.playlistsService.findOne(id, req['user'].id);
  }

  @Patch('playlists/:id')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  @ApiBody({ type: UpdatePlaylistDto })
  update(
    @Param('id') id: number,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @Req() req: any,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto, req['user'].id);
  }

  @Delete('playlists/:id')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  remove(@Param('id') id: number, @Req() req: any) {
    return this.playlistsService.remove(id, req['user'].id);
  }
}
