import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PaginationDto } from './entities/playlist.entity';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  private playlistSelect() {
    return {
      id: true,
      title: true,
      description: true,
      visibility: true,
      authorId: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      videos: {
        orderBy: { position: 'asc' as const },
        select: {
          id: true,
          position: true,
          addedAt: true,
          video: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              duration: true,
              viewsCount: true,
              createdAt: true,
            },
          },
        },
      },
      _count: {
        select: {
          videos: true,
        },
      },
    } satisfies Prisma.PlaylistSelect;
  }

  private async getOwnedPlaylist(id: number, authorId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) throw new NotFoundException('Playlist topilmadi');
    if (playlist.authorId !== authorId) {
      throw new ForbiddenException('Sizga ruxsat yoq');
    }

    return playlist;
  }

  async create(payload: CreatePlaylistDto, authorId: number) {
    const data = await this.prisma.playlist.create({
      data: { ...payload, authorId },
      select: this.playlistSelect(),
    });

    return {
      success: true,
      status: 201,
      message: 'Playlist yaratildi',
      data,
    };
  }

  async findAll(authorId: number, requesterId: number, query?: PaginationDto) {
    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;
    const where =
      requesterId === authorId
        ? { authorId }
        : { authorId, visibility: Visibility.PUBLIC };

    const data = await this.prisma.playlist.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: this.playlistSelect(),
    });

    const total = await this.prisma.playlist.count({ where });

    return {
      success: true,
      status: 200,
      message: 'Playlistlar olindi',
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, authorId: number) {
    const data = await this.prisma.playlist.findUnique({
      where: { id: Number(id) },
      select: this.playlistSelect(),
    });

    if (!data) throw new NotFoundException('Playlist topilmadi');
    if (data.authorId !== authorId && data.visibility === Visibility.PRIVATE)
      throw new ForbiddenException('Sizga ruxsat yoq');

    return {
      success: true,
      message: 'Playlist olindi',
      data,
      status: 200,
    };
  }

  async update(id: number, payload: UpdatePlaylistDto, authorId: number) {
    await this.getOwnedPlaylist(Number(id), authorId);

    const data = await this.prisma.playlist.update({
      where: { id: Number(id) },
      data: payload,
      select: this.playlistSelect(),
    });

    return {
      success: true,
      message: 'Playlist yangilandi',
      status: 200,
      data,
    };
  }

  async remove(id: number, authorId: number) {
    await this.getOwnedPlaylist(Number(id), authorId);

    await this.prisma.playlistVideo.deleteMany({
      where: { playlistId: Number(id) },
    });

    await this.prisma.playlist.delete({ where: { id: Number(id) } });

    return {
      success: true,
      message: 'Playlist ochirildi',
      status: 200,
    };
  }
}
