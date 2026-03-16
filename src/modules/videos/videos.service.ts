import { Injectable, NotFoundException, ConflictException, ForbiddenException } from "@nestjs/common";
import { CreateVideoDto } from "./dto/create-video.dto";
import { PrismaService } from "src/core/prisma/prisma.service";
import { UpdateVideoDto } from "./dto/update-video.dto";

@Injectable()
export class VideoService {
  constructor(private readonly prisma: PrismaService) { }

  async createVideo(payload: CreateVideoDto, userId: number) {

    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const existingVideo = await this.prisma.video.findFirst({
      where: { videoUrl: payload.videoUrl }
    })

    if (existingVideo) {
      throw new ConflictException("Video already exists")
    }

    const video = await this.prisma.video.create({
      data: {
        title: payload.title,
        description: payload.description,
        videoUrl: payload.videoUrl,
        thumbnail: payload.thumbnail,
        duration: payload.duration,
        authorId: userId
      }
    })

    return video
  }




  async updateVideo(id: number, payload: UpdateVideoDto, userId: number) {

    const video = await this.prisma.video.findUnique({
      where: { id }
    })

    if (!video) {
      throw new NotFoundException("Video not found")
    }

    if (video.authorId !== userId) {
      throw new ForbiddenException("You cannot update this video")
    }

    return this.prisma.video.update({
      where: { id },
      data: {
        title: payload.title,
        description: payload.description,
        duration: payload.duration,
        thumbnail: payload.thumbnail
      }
    })

  }
  async getAllVideos(title?: string, description?: string) {
    const where: any = {}

    if (title) {
      where.title = { contains: title, mode: "insensitive" }
    }

    if (description) {
      where.description = { contains: description, mode: "insensitive" }
    }

    return this.prisma.video.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  }
}