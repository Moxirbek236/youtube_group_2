import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  private userPublicSelect() {
    return {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      status: true,
      role: true,
      is_email_verified: true,
      is_phone_verified: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.UserSelect;
  }

  async createAdminUser(
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ) {

    const { email, username, password } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarUrl: string | null = null;

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      avatarUrl = uploaded;
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        avatar: avatarUrl,
        role: 'ADMIN',
      },
      select: this.userPublicSelect(),
    });

    return user;
  }

  findAll() {
    return this.prisma.user.findMany({
      select: this.userPublicSelect(),
    });
  }

  async findOne(id: number, requester: { id: number; role: Role }) {
    if (requester.role === Role.USER && requester.id !== id) {
      throw new ForbiddenException("Siz faqat oz profilingizni kora olasiz");
    }

    const existMe = await this.prisma.user.findUnique({
      where: { id },
      select: this.userPublicSelect(),
    });

    if (!existMe) throw new NotFoundException("User is not found");

    return {
      success: true,
      data: existMe,
    };
  }

  async updateProfile(userId: number, dto: UpdateUserDto, file?: Express.Multer.File) {
    let avatarUrl: string | undefined = undefined;

    if (file) {

      const uploaded = await this.cloudinaryService.uploadImage(file);
      avatarUrl = uploaded
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      select: this.userPublicSelect(),
    });

    return {
      success: true,
      message: "User succesfully updated",
      data: updatedUser,
    };
  }

  async remove(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('User not found');
    }



    await this.prisma.user.delete({
      where: { id: userId },
    })

    return { message: 'User removed successfully.' }
  }
}
