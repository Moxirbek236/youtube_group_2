
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService : JwtService){}

  async canActivate(context: ExecutionContext ): Promise<boolean>{
     const request = context.switchToHttp().getRequest();
     let token = this.extractTokenFromHeader(request)
     console.log(request);
     

     if(!token) throw new UnauthorizedException()

    try {
        let payload = await this.jwtService.verifyAsync(token)
        request['user'] = payload
        return true
    } catch (error) {
        throw new UnauthorizedException()
    }
  }

  private extractTokenFromHeader(request: Request) : string | undefined {
    let [type,token]= request.headers.authorization?.split(" ") || []

    return type == 'Bearer' ? token : undefined
  }
}
