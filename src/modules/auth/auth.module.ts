import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtGlobalModule } from 'src/common/config/jwt.module';

@Module({
  imports:[JwtGlobalModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {} 
