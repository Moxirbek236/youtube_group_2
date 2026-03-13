import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    console.log(request.headers);
    const token = request.headers.authorization?.split(" ")[1]
    
    if (!token) {
      throw new UnauthorizedException("token not found")
    }

    try {
      const data = this.jwtService.verify(token, { secret: process.env.JWT_SECRET })
      
      const user = await this.prisma.user.findUnique({ 
        where: { id: data.id }
      })

      if (!user) {
        throw new UnauthorizedException("user not foun")
      }

      request['user'] = user

      return true
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new UnauthorizedException(error)
    }
  }
}
