import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtModuleConfig } from './jwt';

@Global()
@Module({
  imports: [JwtModule.register(JwtModuleConfig)],
  exports: [JwtModule],
})
export class JwtGlobalModule {}
