import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, VideoStatus, Visibility } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeBigInts<T>(value: T): T {
    return JSON.parse(
      JSON.stringify(value, (_, currentValue) =>
        typeof currentValue === 'bigint' ? Number(currentValue) : currentValue,
      ),
    ) as T;
  }

  private videoSelect() {
    return {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
      videoUrl: true,
      duration: true,
      status: true,
      visibility: true,
      viewsCount: true,
      likesCount: true,
      dislikesCount: true,
      commentsCount: true,
      createdAt: true,
      authorId: true,
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    } satisfies Prisma.VideoSelect;
  }

  async create(createVideoDto: CreateVideoDto, authorId: number) {
    const data = await this.prisma.video.create({
      data: {
        ...createVideoDto,
        visibility: createVideoDto.visibility ?? Visibility.PUBLIC,
        status: createVideoDto.status ?? VideoStatus.PUBLISHED,
        authorId,
      },
      select: this.videoSelect(),
    });

    return {
      success: true,
      status: 201,
      message: 'Video yaratildi',
      data: this.normalizeBigInts(data),
    };
  }

  async findAll() {
    const data = await this.prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      select: this.videoSelect(),
    });

    return {
      success: true,
      status: 200,
      data: this.normalizeBigInts(data),
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.video.findUnique({
      where: { id },
      select: this.videoSelect(),
    });

    if (!data) {
      throw new NotFoundException('Video topilmadi');
    }

    return {
      success: true,
      status: 200,
      data: this.normalizeBigInts(data),
    };
  }

  async update(
    id: number,
    updateVideoDto: UpdateVideoDto,
    requester: { id: number; role: Role },
  ) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!video) {
      throw new NotFoundException('Video topilmadi');
    }

    if (
      requester.role === Role.USER &&
      video.authorId !== requester.id
    ) {
      throw new ForbiddenException('Siz bu videoni yangilay olmaysiz');
    }

    const data = await this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
      select: this.videoSelect(),
    });

    return {
      success: true,
      status: 200,
      message: 'Video yangilandi',
      data: this.normalizeBigInts(data),
    };
  }

  async remove(id: number, requester: { id: number; role: Role }) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!video) {
      throw new NotFoundException('Video topilmadi');
    }

    if (
      requester.role === Role.USER &&
      video.authorId !== requester.id
    ) {
      throw new ForbiddenException('Siz bu videoni ochira olmaysiz');
    }

    await this.prisma.like.deleteMany({
      where: { videoId: id },
    });
    await this.prisma.watchHistory.deleteMany({
      where: { videoId: id },
    });
    await this.prisma.playlistVideo.deleteMany({
      where: { videoId: id },
    });
    await this.prisma.like.deleteMany({
      where: {
        comment: {
          videoId: id,
        },
      },
    });
    await this.prisma.comment.deleteMany({
      where: { videoId: id },
    });
    await this.prisma.video.delete({
      where: { id },
    });

    return {
      success: true,
      status: 200,
      message: 'Video ochirildi',
    };
  }
}
