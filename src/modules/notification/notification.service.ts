import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) { }

  async createNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string
  ) {
    return this.prisma.notification.create({
      data: { userId, type, title, message }
    });
  }

  async findAll(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      status: 200,
      data: notifications
    };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException("This is not your notification");
    }
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return {
      success: true,
      status: 200,
      message: "Marked as read"
    };
  }


  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return {
      success: true,
      status: 200,
      message: "Marked all as read"
    };
  }



}
