import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PaginationDto } from './entities/playlist.entity';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreatePlaylistDto, authorId: number) {
    const data = await this.prisma.playlist.create({
      data: { ...payload, authorId },
      select: {
        id: true,
        title: true,
        description: true,
        videos: true,
        authorId: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'Playlist successfully created ✅',
      data,
    };
  }

  async findAll(authorId: number, query?: PaginationDto) {
    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.playlist.findMany({
        where: { authorId },
        skip: Number(skip),
        take: Number(limit),
        select: {
          id: true,
          title: true,
          authorId: true,
          createdAt: true,
        },
      }),
      this.prisma.playlist.count({ where: { authorId } }),
    ]);

    return {
      success: true,
      message: 'Playlists successfully fetched ✅',
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
    const data = await this.prisma.playlist.findFirst({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        authorId: true,
        createdAt: true,
      },
    });

    if (!data) throw new NotFoundException('Playlist not found ❌');
    if (data.authorId !== authorId)
      throw new ForbiddenException('Access denied ❌');

    return {
      success: true,
      message: 'Playlist successfully fetched ✅',
      data,
    };
  }

  async update(id: number, payload: UpdatePlaylistDto, authorId: number) {
    const existing = await this.prisma.playlist.findFirst({
      where: { id: Number(id) },
    });

    if (!existing) throw new NotFoundException('Playlist not found ❌');
    if (existing.authorId !== authorId)
      throw new ForbiddenException('Access denied ❌');

    const data = await this.prisma.playlist.update({
      where: { id: Number(id) },
      data: payload,
      select: {
        id: true,
        title: true,
        authorId: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'Playlist successfully updated ✅',
      data,
    };
  }

  async remove(id: number, authorId: number) {
    const existing = await this.prisma.playlist.findFirst({
      where: { id: Number(id) },
    });

    if (!existing) throw new NotFoundException('Playlist not found ❌');
    if (existing.authorId !== authorId)
      throw new ForbiddenException('Access denied ❌');

    await this.prisma.playlist.delete({ where: { id: Number(id) } });

    return {
      success: true,
      message: 'Playlist successfully deleted ✅',
    };
  }
}
