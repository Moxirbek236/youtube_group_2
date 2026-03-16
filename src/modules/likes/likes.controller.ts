import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorators';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/checkRole.guard';
import { LikesService } from './likes.service';

@ApiTags('likes')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('token')
@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('comments/:id/like')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  likeComment(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.likesService.likeComment(id, req['user'].id);
  }

  @Post('comments/:id/dislike')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  dislikeComment(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.likesService.dislikeComment(id, req['user'].id);
  }

  @Delete('comments/:id/like')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  unlikeComment(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.likesService.unlikeComment(id, req['user'].id);
  }

  @Delete('comments/:id/dislike')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  undislikeComment(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.likesService.undislikeComment(id, req['user'].id);
  }

  @Post('videos/:id/like')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  likeVideo(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.likesService.likeVideo(id, req['user'].id);
  }

  @Post('videos/:id/dislike')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  dislikeVideo(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.likesService.dislikeVideo(id, req['user'].id);
  }

  @Delete('videos/:id/like')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  unlikeVideo(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.likesService.unlikeVideo(id, req['user'].id);
  }

  @Delete('videos/:id/dislike')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  undislikeVideo(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.likesService.undislikeVideo(id, req['user'].id);
  }
}
