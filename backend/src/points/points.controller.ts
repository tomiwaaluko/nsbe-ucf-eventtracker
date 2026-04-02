import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { BulkAwardPointsDto } from './dto/bulk-award-points.dto';
import { ResolveMembersDto } from './dto/resolve-members.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { isAdmin } from '../common/roles.util';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(
    private readonly pointsService: PointsService,
    private readonly prisma: PrismaService,
  ) {}

  private async requireAdmin(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('types')
  getPointTypes() {
    return this.pointsService.getPointTypes();
  }

  @Get('semesters')
  async getSemesters(@Req() req) {
    await this.requireAdmin(req.user.id);
    return this.pointsService.getSemesters();
  }

  @Get('leaderboard')
  async getLeaderboard(@Req() req, @Query('semester') semester: string) {
    await this.requireAdmin(req.user.id);
    return this.pointsService.getLeaderboard(semester);
  }

  @Get('member/:id')
  async getMemberPoints(
    @Req() req,
    @Param('id') memberId: string,
    @Query('semester') semester: string,
  ) {
    await this.requireAdmin(req.user.id);
    return this.pointsService.getMemberPoints(memberId, semester);
  }

  @Get('manual')
  async getManualEntries(@Req() req, @Query('semester') semester: string) {
    await this.requireAdmin(req.user.id);
    return this.pointsService.getManualEntries(semester);
  }

  @Post('bulk')
  async bulkAwardPoints(@Req() req, @Body() dto: BulkAwardPointsDto) {
    await this.requireAdmin(req.user.id);
    return this.pointsService.bulkAwardPoints(dto, req.user.id);
  }

  @Post('resolve-members')
  async resolveMembers(@Req() req, @Body() dto: ResolveMembersDto) {
    await this.requireAdmin(req.user.id);
    return this.pointsService.resolveMembers(dto);
  }

  @Delete('manual/:id')
  async deleteEntry(@Req() req, @Param('id') id: string) {
    await this.requireAdmin(req.user.id);
    return this.pointsService.deleteEntry(id);
  }
}
