import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsQueryDto } from './entities/comment.entity';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth('token')
  @Post('videos/:videoId/comments')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  @ApiBody({ type: CreateCommentDto })
  create(
    @Param('videoId', ParseIntPipe) videoId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.commentsService.create(videoId, createCommentDto, req['user']);
  }

  @Get('videos/:videoId/comments')
  @ApiOperation({ summary: 'PUBLIC' })
  findAll(
    @Param('videoId', ParseIntPipe) videoId: number,
    @Query() query?: CommentsQueryDto,
  ) {
    return this.commentsService.findAll(videoId, query);
  }

  @Get('comments/:id')
  @ApiOperation({ summary: 'PUBLIC' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth('token')
  @Patch('comments/:id')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: any,
  ) {
    return this.commentsService.update(id, updateCommentDto, req['user']);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth('token')
  @Patch('comments/:id/pin')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  togglePin(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.commentsService.togglePin(id, req['user']);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth('token')
  @Delete('comments/:id')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.commentsService.remove(id, req['user']);
  }
}

