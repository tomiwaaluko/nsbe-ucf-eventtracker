import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  async getMyProgress(@Req() req, @Query('semester') semester: string) {
    if (!semester) {
      semester = 'Fall 2024'; // default
    }
    return this.statsService.getMemberProgress(req.user.id, semester);
  }

  @Get('leaderboard/111')
  async get111Leaderboard(@Query('semester') semester: string) {
    if (!semester) {
      semester = 'Fall 2024'; // default
    }
    return this.statsService.get111Leaderboard(semester);
  }

  @Get('leaderboard/333')
  async get333Leaderboard(@Query('semester') semester: string) {
    if (!semester) {
      semester = 'Fall 2024'; // default
    }
    return this.statsService.get333Leaderboard(semester);
  }
}
