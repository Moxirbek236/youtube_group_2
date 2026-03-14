import { Injectable, NotFoundException } from '@nestjs/common';
import { LikeType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
