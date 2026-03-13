import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/authDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post("register")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        username: { type: "string" },
        password: { type: "string" },
        avatar: { type: "string", format: "binary" },
      },
      required: ["firstName", "lastName", "email", "username","password"], 
    },
  })
  @UseInterceptors(FileInterceptor("avatar"))
  
  async register(
    @Body() payload: RegisterDto,
    @UploadedFile() avatar?: Express.Multer.File
  ) {
    if (avatar) {
      payload.avatar = await this.cloudinaryService.uploadImage(avatar)
    }
    return this.authService.register(payload)
  }
}