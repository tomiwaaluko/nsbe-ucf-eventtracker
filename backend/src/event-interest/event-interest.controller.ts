import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { EventInterestService } from './event-interest.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { MembersService } from '../members/members.service';
import { isAdmin } from '../common/roles.util';

@Controller('event-interest')
@UseGuards(JwtAuthGuard)
export class EventInterestController {
  constructor(
    private eventInterestService: EventInterestService,
    private membersService: MembersService,
  ) {}

  /**
   * POST /event-interest/:eventId - Mark event as plan to attend
   */
  @Post(':eventId')
  async markPlanToAttend(@Req() req, @Param('eventId') eventId: string) {
    return this.eventInterestService.markPlanToAttend(req.user.id, eventId);
  }

  /**
   * DELETE /event-interest/:eventId - Unmark plan to attend
   */
  @Delete(':eventId')
  @HttpCode(HttpStatus.OK)
  async unmarkPlanToAttend(@Req() req, @Param('eventId') eventId: string) {
    return this.eventInterestService.unmarkPlanToAttend(req.user.id, eventId);
  }

  /**
   * GET /event-interest/my - Get all events I plan to attend
   */
  @Get('my')
  async getMyPlannedEvents(@Req() req) {
    return this.eventInterestService.getMyPlannedEvents(req.user.id);
  }

  /**
   * GET /event-interest/event/:eventId - Get members planning to attend event
   */
  @Get('event/:eventId')
  async getEventPlanners(@Req() req, @Param('eventId') eventId: string) {
    // For regular users, show friends first (Phase 2)
    // For now, just return all planners
    return this.eventInterestService.getEventPlanners(eventId, req.user.id);
  }

  /**
   * GET /event-interest/event/:eventId/with-friends - Get planners with friend highlighting
   */
  @Get('event/:eventId/with-friends')
  async getEventPlannersWithFriends(
    @Req() req,
    @Param('eventId') eventId: string,
  ) {
    // Phase 2: Inject FriendsService and use getEventPlannersWithFriends
    // For now, just return regular planners
    return this.eventInterestService.getEventPlanners(eventId, req.user.id);
  }

  /**
   * GET /event-interest/check/:eventId - Check if I'm planning to attend
   */
  @Get('check/:eventId')
  async checkIfPlanning(@Req() req, @Param('eventId') eventId: string) {
    const isPlanning = await this.eventInterestService.checkIfPlanning(
      req.user.id,
      eventId,
    );
    return { isPlanning };
  }

  /**
   * GET /event-interest/stats - Admin: Get planning stats for all events
   */
  @Get('stats')
  async getEventPlanningStats(@Req() req, @Query('semester') semester?: string) {
    // Check admin permission
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }

    return this.eventInterestService.getAllEventPlanningStats(semester);
  }
}
