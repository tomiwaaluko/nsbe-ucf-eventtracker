import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [OAuthController],
  providers: [AuthService, OAuthService],
  exports: [AuthService, OAuthService],
})
export class AuthModule {}
