import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { Role } from '@prisma/client';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }


  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiOperation({ summary: "Barcha notificationlarni olish" })
  findAll(
    @Req() req: any
  ) {
    return this.notificationService.findAll(req['user'].id);
  }



  @Patch(":id/read")
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiOperation({ summary: "Notificationni o'qildi deb belgilash" })
  markAsRead(
    @Param("id") id: number, @Req() req: any
  ) {
    return this.notificationService.markAsRead(id, req['user'].id)
  }


  @Patch("read-all")
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiOperation({ summary: "Hammasi o'qildi deb belgilash" })
  markAllAsRead(
    @Req() req: any
  ) {
    return this.notificationService.markAllAsRead(req['user'].id)
  }


}
