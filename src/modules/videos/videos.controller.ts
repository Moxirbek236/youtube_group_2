import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFiles,
  Req,
  UploadedFile,
  ParseIntPipe
} from '@nestjs/common';

import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { VideoService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideoService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post("create")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        duration: { type: "number" },
        video: { type: "string", format: "binary" },
        thumbnail: { type: "string", format: "binary" }
      },
      required: ["title", "video", "duration"]
    }
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 }
    ])
  )
  async createVideo(
    @Body() payload: CreateVideoDto,
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[]
      thumbnail?: Express.Multer.File[]
    },
    @Req() req: any
  ) {

    if (files?.video?.length) {
      payload.videoUrl = await this.cloudinaryService.uploadImage(files.video[0])
    }

    if (files?.thumbnail?.length) {
      payload.thumbnail = await this.cloudinaryService.uploadImage(files.thumbnail[0])
    }

    const userId = req.user.id

    return this.videosService.createVideo(payload, userId)
  }

  @Patch(":id")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        duration: { type: "number" },
        thumbnail: { type: "string", format: "binary" }
      }
    }
  })
  @UseInterceptors(FileInterceptor("thumbnail"))
  async updateVideo(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateVideoDto,
    @UploadedFile() thumbnail: Express.Multer.File,
    @Req() req: any
  ) {

    if (thumbnail) {
      payload.thumbnail = await this.cloudinaryService.uploadImage(thumbnail)
    }

    const userId = req.user.id

    return this.videosService.updateVideo(id, payload, userId)
  }
}