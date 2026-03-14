import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/authDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  private userSelect() {
    return {
      id: true,
      avatar: true,
      email: true,
      firstName: true,
      role: true,
      is_email_verified: true,
      is_phone_verified: true,
      lastName: true,
      status: true,
      username: true,
    } as const;
  }

  async register(payload: RegisterDto) {
    const existEmail = await this.prisma.user.findMany({
      where: { email: payload.email },
    });
    if (existEmail.length) throw new ConflictException('Email is already used');

    const existUsername = await this.prisma.user.findMany({
      where: { username: payload.username },
    });
    if (existUsername.length)
      throw new ConflictException('Username is already used');

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const data = await this.prisma.user.create({
      data: { ...payload, password: hashedPassword },
      select: this.userSelect(),
    });

    return {
      success: true,
      message: 'User successfully registered',
      accessToken: this.jwt.sign({ id: data.id, role: data.role }),
      data,
    };
  }

  async login(payload: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: payload.login }, { username: payload.login }],
      },
      select: {
        ...this.userSelect(),
        password: true,
      },
    });

    if (!user) throw new UnauthorizedException('Foydalanuvchi Toplmadi!!!');

    const passwordOk = await bcrypt.compare(payload.password, user.password);

    if (!passwordOk) throw new UnauthorizedException('Parol topilmadi!!!');

    const { password, ...safeUser } = user;

    return {
      success: true,
      message: 'Login successful',
      accessToken: this.jwt.sign({ id: safeUser.id, role: safeUser.role }),
      data: safeUser,
    };
  }
}
