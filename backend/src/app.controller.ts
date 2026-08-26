import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Hostnames + roles for cutover verification (no secrets). */
  @Get('health/db')
  getDatabaseHealth() {
    return this.appService.getDatabaseStatus();
  }
}
