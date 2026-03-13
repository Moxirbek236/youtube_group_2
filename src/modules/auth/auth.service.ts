import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/authDto';
import { PrismaService } from 'src/core/prisma/prisma.service';


@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) { }
  async register(payload: RegisterDto) { 
    const existEmail = await this.prisma.user.findMany({
      where: { email: payload.email },
    });
    if (existEmail.length) throw new ConflictException("Email is already used ❌");

    const existUsername = await this.prisma.user.findMany({
      where: { username: payload.username },
    });
    if (existUsername.length) throw new ConflictException("Username is already used ❌");

    const data = await this.prisma.user.create({ data: payload }); 

    return {
      success: true,
      message: "User successfully registered ✅",
      data,
    };
  }


}
