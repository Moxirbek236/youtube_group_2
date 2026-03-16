import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlaylistVideoDto } from './dto/create-playlist-video.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class PlaylistVideosService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOwnedPlaylist(playlistId: number, authorId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Bunday playlist topilmadi');
    }

    if (playlist.authorId !== authorId) {
      throw new ForbiddenException('Siz faqat oz playlistingizni boshqarishingiz mumkin');
    }

    return playlist;
  }

  private async resequencePlaylist(playlistId: number) {
    const items = await this.prisma.playlistVideo.findMany({
      where: { playlistId },
      orderBy: [{ position: 'asc' }, { addedAt: 'asc' }],
      select: { id: true, position: true },
    });

    for (const [index, item] of items.entries()) {
      const nextPosition = index + 1;
      if (item.position === nextPosition) continue;

      await this.prisma.playlistVideo.update({
          where: { id: item.id },
          data: { position: nextPosition },
          select: { id: true },
      });
    }
  }

  private async listPlaylistVideos(playlistId: number) {
    return this.prisma.playlistVideo.findMany({
      where: { playlistId },
      orderBy: { position: 'asc' },
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
            visibility: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async create(
    payload: CreatePlaylistVideoDto,
    authorId: number,
    playlistId: number,
  ) {
    await this.getOwnedPlaylist(playlistId, authorId);

    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
    });

    if (!video) {
      throw new NotFoundException('Bunday video topilmadi');
    }

    const exists = await this.prisma.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId: payload.videoId,
        },
      },
    });

    if (exists) {
      throw new ConflictException('Bu video playlistga avval qoshilgan');
    }

    const total = await this.prisma.playlistVideo.count({
      where: { playlistId },
    });

    const position = Math.min(Math.max(payload.position, 1), total + 1);

    const existingItems = await this.prisma.playlistVideo.findMany({
      where: { playlistId, position: { gte: position } },
      orderBy: { position: 'desc' },
      select: { id: true, position: true },
    });

    for (const item of existingItems) {
      await this.prisma.playlistVideo.update({
        where: { id: item.id },
        data: { position: item.position + 1 },
      });
    }

    const data = await this.prisma.playlistVideo.create({
      data: {
        playlistId,
        videoId: payload.videoId,
        position,
      },
      select: {
        id: true,
        addedAt: true,
        position: true,
        video: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            duration: true,
          },
        },
      },
    });

    await this.resequencePlaylist(playlistId);

    return {
      success: true,
      status: 201,
      message: 'Video playlistga qoshildi',
      data,
    };
  }

  async findAll(playlistId: number, authorId: number) {
    await this.getOwnedPlaylist(playlistId, authorId);

    const data = await this.listPlaylistVideos(playlistId);

    return {
      success: true,
      status: 200,
      message: 'Playlist videolari olindi',
      data,
    };
  }

  async remove(playlistId: number, videoId: number, authorId: number) {
    await this.getOwnedPlaylist(playlistId, authorId);

    const existing = await this.prisma.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Playlist ichida bunday video topilmadi');
    }

    await this.prisma.playlistVideo.delete({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
    });

    await this.resequencePlaylist(playlistId);

    const data = await this.listPlaylistVideos(playlistId);

    return {
      success: true,
      status: 200,
      message: 'Video playlistdan ochirildi',
      data,
    };
  }
}
