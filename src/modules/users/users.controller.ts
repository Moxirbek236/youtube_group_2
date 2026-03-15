import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFile, 
  Req,
  Put,
  Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/checkRole.guard';
import { Roles } from 'src/common/decorators/role.decorators';
import { Role } from '@prisma/client';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
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
        avatar: { type: "string", format: "binary" }, // swagger uchun
      },
    },
  })
  @UseInterceptors(FileInterceptor("avatar"))
  createAdminUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File, // file keladi
  ) {
    // Service ichida Cloudinary ga upload qiladi va URL saqlaydi
    return this.usersService.createAdminUser(createUserDto, file);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Req() req:Request) {
    return this.usersService.findOneMe(req["user"].id);
  }

   @Put()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        username: { type: "string" },
        avatar: { type: "string", format: "binary" },
      },
    },
  })
  @UseInterceptors(FileInterceptor("avatar"))
  updateProfile(
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req()req:Request
  ) {
    return this.usersService.updateProfile(req["user"].id, dto, file);
  }

 

 
 

 
 
}