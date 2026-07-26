import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { MembersService } from '../members/members.service';
import { isAdmin } from '../common/roles.util';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly membersService: MembersService,
  ) {}

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

  /**
   * GET /stats/leaderboard/me - Get my leaderboard position
   */
  @Get('leaderboard/me')
  async getMyLeaderboardPosition(@Req() req, @Query('semester') semester?: string) {
    return this.statsService.getMemberLeaderboardPosition(req.user.id, semester);
  }

  /**
   * GET /stats/leaderboard/top - Get top N members
   */
  @Get('leaderboard/top')
  async getTopMembers(
    @Query('limit') limit?: string,
    @Query('semester') semester?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.statsService.getTopMembers(limitNumber, semester);
  }

  /**
   * GET /stats/leaderboard/stats - Get leaderboard statistics
   */
  @Get('leaderboard/stats')
  async getLeaderboardStats(@Query('semester') semester?: string) {
    return this.statsService.getLeaderboardStats(semester);
  }

  /**
   * GET /stats/leaderboard - Get global leaderboard
   * Query params: semester (optional), limit (optional)
   */
  @Get('leaderboard')
  async getGlobalLeaderboard(
    @Query('semester') semester?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.statsService.getGlobalLeaderboard(semester, limitNumber);
  }

  /**
   * GET /stats/leaderboard/:memberId - Get specific member's position
   */
  @Get('leaderboard/:memberId')
  async getMemberPosition(
    @Param('memberId') memberId: string,
    @Query('semester') semester?: string,
  ) {
    return this.statsService.getMemberLeaderboardPosition(memberId, semester);
  }

  /**
   * SECURITY: admin only. Returns org-wide totals; the route was reachable by
   * any authenticated member despite its name.
   */
  @Get('admin')
  async getAdminStats(@Req() req, @Query('semester') semester: string) {
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    if (!semester) {
      semester = 'Fall 2024'; // default
    }
    return this.statsService.getAdminStats(semester);
  }
}
