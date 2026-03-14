import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaylistVideoDto } from './dto/create-playlist-video.dto';
import { UpdatePlaylistVideoDto } from './dto/update-playlist-video.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class PlaylistVideosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: CreatePlaylistVideoDto,
    authorId: number,
    playlisId: number,
  ) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlisId },
    });

    if (!playlist) {
      throw new NotFoundException('bunday playlist topilmadi');
    }

    const video = await this.prisma.video.findFirst({
      where: { id: payload.videoId },
    });

    if (!video) {
      throw new NotFoundException('bunday video topilmadi');
    }

    const data = await this.prisma.playlistVideo.create({
      data: {
        playlistId: playlisId,
        videoId: payload.videoId,
        position: payload.position,
      },
      select: {
        id: true,
        addedAt: true,
        position: true,
        playlist: true,
        video: true,
      },
    });

    return {
      success: true,
      status: 201,
      message: 'video Playlistga qoshildi',
      data,
    };
  }

  async findAll() {
    const data = await this.prisma.playlistVideo.findMany({})
  }

  findOne(id: number) {
    return `This action returns a #${id} playlistVideo`;
  }

  update(id: number, updatePlaylistVideoDto: UpdatePlaylistVideoDto) {
    return `This action updates a #${id} playlistVideo`;
  }

  remove(id: number) {
    return `This action removes a #${id} playlistVideo`;
  }
}
