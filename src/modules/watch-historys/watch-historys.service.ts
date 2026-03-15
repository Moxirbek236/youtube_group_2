import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { PaginationDto } from './entities/watch-history.entity';

@Injectable()
export class WatchHistorysService {
  constructor(private readonly prisma: PrismaService) {}

  async recordView(
    videoId: number,
    userId: number,
    payload: CreateWatchHistoryDto,
  ) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        duration: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video topilmadi');
    }

    const existing = await this.prisma.watchHistory.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      await this.prisma.watchHistory.update({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
        data: {
          watchTime: payload.watchTime ?? 0,
          watchedAt: new Date(),
        },
      });
    } else {
      await this.prisma.watchHistory.create({
        data: {
          userId,
          videoId,
          watchTime: payload.watchTime ?? 0,
        },
      });
    }

    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      status: 201,
      message: 'View recorded',
      data: {
        videoId: video.id,
        title: video.title,
        watchTime: payload.watchTime ?? 0,
      },
    };
  }

  async findAll(userId: number, query?: PaginationDto) {
    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    const data = await this.prisma.watchHistory.findMany({
      where: { userId },
      skip: Number(skip),
      take: Number(limit),
      orderBy: { watchedAt: 'desc' },
      select: {
        id: true,
        watchedAt: true,
        watchTime: true,
        video: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            duration: true,
            viewsCount: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.watchHistory.count({
      where: { userId },
    });

    return {
      success: true,
      status: 200,
      message: 'Watch history olindi',
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async clear(userId: number) {
    await this.prisma.watchHistory.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      status: 200,
      message: 'Watch history tozalandi',
    };
  }
}

