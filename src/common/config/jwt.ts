import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export const JWTAccessOptions: JwtSignOptions = {
  secret: process.env.JWT_ACCESS_SECRET || 'shaftoli',
  expiresIn: '2000h',
};

export const JwtModuleConfig: JwtModuleOptions = {
  secret: JWTAccessOptions.secret,
  signOptions: { expiresIn: JWTAccessOptions.expiresIn },
};
