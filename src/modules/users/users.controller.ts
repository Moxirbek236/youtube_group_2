import {
  Controller, Get, Post, Body, Param,
  UseGuards, UseInterceptors, UploadedFile,
  Req,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/checkRole.guard';
import { Roles } from 'src/common/decorators/role.decorators';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth('token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  @ApiOperation({ summary: `${Role.ADMIN} ${Role.SUPERADMIN}` })
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Get()
  @ApiOperation({ summary: `${Role.ADMIN} ${Role.SUPERADMIN}` })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @Get(':id')
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.findOne(id, req['user']);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @Put()
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
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
    @Req() req: any
  ) {
    return this.usersService.updateProfile(req['user'].id, dto, file);
  }
}
