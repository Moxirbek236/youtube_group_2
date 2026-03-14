import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorators';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/checkRole.guard';
import { LikesService } from './likes.service';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('token')
@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}
  
  // POST /comments/:id/like
  // POST /comments/:id/dislike
  // DELETE /comments/:id/like
  
  @ApiTags('Comments')
  @Post('comments/:id/like')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER}, ${Role.ADMIN}, ${Role.SUPERADMIN}` })
  likeComment(@Param('id') id: string, @Req() req: any) {
    return this.likesService.likeComment(Number(id), req['user'].id);
  }
  
  @ApiTags('Comments')
  @Post('comments/:id/dislike')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER}, ${Role.ADMIN}, ${Role.SUPERADMIN}` })
  dislikeComment(@Param('id') id: string, @Req() req: any) {
    return this.likesService.dislikeComment(Number(id), req['user'].id);
  }

  @ApiTags('Videos')
  @Post('videos/:id/like')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER}, ${Role.ADMIN}, ${Role.SUPERADMIN}` })
  likeVideo(@Param('id') id: string, @Req() req: any) {
    return this.likesService.likeVideo(Number(id), req['user'].id);
  }
  
  @ApiTags('Videos')
  @Post('videos/:id/dislike')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER}, ${Role.ADMIN}, ${Role.SUPERADMIN}` })
  dislikeVideo(@Param('id') id: string, @Req() req: any) {
    return this.likesService.dislikeVideo(Number(id), req['user'].id);
  }
}
