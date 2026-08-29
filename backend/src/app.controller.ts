import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Unauthenticated liveness probe for Railway (and similar) health checks.
   * Does not touch Prisma, Supabase, or other optional clients.
   */
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
