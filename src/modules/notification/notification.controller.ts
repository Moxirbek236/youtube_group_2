import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from 'src/common/decorators/role.decorators';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/checkRole.guard';

@ApiTags('Notification')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('token')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }


  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findAll(
    @Req() req: any
  ) {
    return this.notificationService.findAll(req['user'].id);
  }



  @Patch(":id/read")
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  markAsRead(
    @Param("id", ParseIntPipe) id: number, @Req() req: any
  ) {
    return this.notificationService.markAsRead(id, req['user'].id)
  }


  @Patch("read-all")
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  markAllAsRead(
    @Req() req: any
  ) {
    return this.notificationService.markAllAsRead(req['user'].id)
  }


}
