import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';

export class CheckDuplicateDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Unauthenticated. Returns a boolean verdict only - see
   * AuthService.checkDuplicateUser. Throttled hard because a duplicate check is
   * inherently an existence oracle and this endpoint needs no session at all.
   */
  @Post('check-duplicate')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  async checkDuplicate(@Body() dto: CheckDuplicateDto) {
    return this.authService.checkDuplicateUser(
      dto.firstName,
      dto.lastName,
      dto.email,
    );
  }

  /**
   * Unauthenticated and triggers an outbound email, so it is both an abuse
   * vector (mail flooding a victim's inbox) and a cost centre.
   */
  @Post('forgot-password')
  @Throttle({ default: { ttl: 300_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }
}
