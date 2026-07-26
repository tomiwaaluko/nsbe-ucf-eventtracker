import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckInWithCodeDto } from './dto/check-in-code.dto';
import { ManualCheckInDto } from './dto/manual-check-in.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { MembersService } from '../members/members.service';
import { isAdmin } from '../common/roles.util';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly membersService: MembersService,
  ) {}

  @Post('check-in')
  async checkIn(@Req() req, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(req.user.id, dto);
  }

  /**
   * SECURITY: throttled tightly. The check-in code is 6 characters from a
   * 32-character alphabet, so an unthrottled attacker could search the space
   * and mark attendance for an event they never went to. 10 attempts per
   * minute makes that search impractical while leaving room for typos.
   */
  @Post('check-in-code')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async checkInWithCode(@Req() req, @Body() dto: CheckInWithCodeDto) {
    return this.attendanceService.checkInWithCode(req.user.id, dto);
  }

  @Post('manual')
  async manualCheckIn(@Req() req, @Body() dto: ManualCheckInDto) {
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.attendanceService.manualCheckIn(req.user.id, dto);
  }

  @Get('my')
  async getMyHistory(@Req() req, @Query('semester') semester?: string) {
    return this.attendanceService.getMemberHistory(req.user.id, semester);
  }

  @Get('events/:id')
  async getEventAttendance(@Req() req, @Param('id') eventId: string) {
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.attendanceService.getEventAttendance(eventId);
  }

  @Get()
  async getAllAttendance(@Req() req, @Query('semester') semester?: string) {
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.attendanceService.getAllAttendance(semester);
  }
}
