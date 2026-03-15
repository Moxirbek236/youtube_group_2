import { Injectable, NotFoundException } from '@nestjs/common';
import { LikeType, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService
  ) { }

  async likeComment(commentId: number, authorId: number) {
    const existLike = await this.prisma.like.findMany({
      where: { commentId },
    });
    if (existLike) {
      if (existLike[0].type == 'LIKE') {
        await this.prisma.like.delete({
          where: { id: existLike[0].id },
        });
        return { status: 201, succes: true, message: 'Like Deleted' };
      }
    }
    await this.prisma.like
      .create({
        data: {
          type: 'LIKE',
          commentId: commentId,
          userId: authorId,
        },
      })
      .catch((err) => console.log(err));
    return {
      status: 201,
      succes: true,
      message: 'Liked video',
    };
  }

  async dislikeComment(commentId: number, authorId: number) {
    const existLike = await this.prisma.like.findMany({
      where: { commentId },
    });
    if (existLike) {
      if (existLike[0].type == 'DISLIKE') {
        await this.prisma.like.delete({
          where: { id: existLike[0].id },
        });
        return { status: 201, succes: true, message: 'Like Deleted' };
      }
    }
    await this.prisma.like
      .create({
        data: {
          type: 'DISLIKE',
          commentId: commentId,
          userId: authorId,
        },
      })
      .catch((err) => console.log(err));
    return {
      status: 201,
      succes: true,
      message: 'Liked video',
    };
  }

  async dislikeVideo(commentId: number, authorId: number) {
    const existLike = await this.prisma.like.findMany({
      where: { commentId },
    });
    if (existLike) {
      if (existLike[0].type == 'DISLIKE') {
        await this.prisma.like.delete({
          where: { id: existLike[0].id },
        });
        return { status: 201, succes: true, message: 'Like Deleted' };
      }
    }
    await this.prisma.like
      .create({
        data: {
          type: 'DISLIKE',
          commentId: commentId,
          userId: authorId,
        },
      })
      .catch((err) => console.log(err));
    return {
      status: 201,
      succes: true,
      message: 'Liked video',
    };
  }

  async likeVideo(commentId: number, authorId: number) {
    const existLike = await this.prisma.like.findMany({
      where: { commentId, userId: authorId },
    });
    if (existLike) {
      if (existLike[0].type == 'LIKE') {
        await this.prisma.like.delete({
          where: { id: existLike[0].id },
        });
        return { status: 201, succes: true, message: 'Like Deleted' };
      }
    }
    await this.prisma.like
      .create({
        data: {
          type: 'LIKE',
          commentId: commentId,
          userId: authorId,
        },
      })
      .catch((err) => console.log(err));



    const video = await this.prisma.video.findFirst({
      where: { id: commentId },
      select: { authorId: true, title: true }
    })


    if (video && video.authorId !== authorId) {
      await this.notificationService.createNotification(
        video.authorId,
        NotificationType.VIDEO_LIKED,
        "Someone liked your video",
        `${video.title} like this video`
      )
    }
    return {
      status: 201,
      succes: true,
      message: 'Liked video',
    };
  }
}