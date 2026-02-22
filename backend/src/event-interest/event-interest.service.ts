import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventInterestStatus } from '@prisma/client';

@Injectable()
export class EventInterestService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mark event as "plan to attend"
   */
  async markPlanToAttend(memberId: string, eventId: string) {
    // Verify event exists and is active
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive) {
      throw new BadRequestException('Event is no longer active');
    }

    // Check if event has already passed
    if (event.endTime < new Date()) {
      throw new BadRequestException('Cannot plan to attend past events');
    }

    // Check if already checked in (can't plan after attending)
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        memberId_eventId: {
          memberId,
          eventId,
        },
      },
    });

    if (attendance) {
      throw new BadRequestException('You have already checked into this event');
    }

    // Upsert (create or update to PLANNING status)
    const interest = await this.prisma.eventInterest.upsert({
      where: {
        memberId_eventId: {
          memberId,
          eventId,
        },
      },
      update: {
        status: EventInterestStatus.PLANNING,
        updatedAt: new Date(),
      },
      create: {
        memberId,
        eventId,
        status: EventInterestStatus.PLANNING,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startTime: true,
            location: true,
          },
        },
      },
    });

    return {
      message: 'Marked as planning to attend',
      interest,
    };
  }

  /**
   * Unmark "plan to attend"
   */
  async unmarkPlanToAttend(memberId: string, eventId: string) {
    const interest = await this.prisma.eventInterest.findUnique({
      where: {
        memberId_eventId: {
          memberId,
          eventId,
        },
      },
    });

    if (!interest) {
      throw new NotFoundException('Plan to attend record not found');
    }

    // Delete the record (cleaner than marking as CANCELLED)
    await this.prisma.eventInterest.delete({
      where: {
        memberId_eventId: {
          memberId,
          eventId,
        },
      },
    });

    return {
      message: 'Removed from plan to attend',
    };
  }

  /**
   * Get all events user plans to attend
   */
  async getMyPlannedEvents(memberId: string) {
    const interests = await this.prisma.eventInterest.findMany({
      where: {
        memberId,
        status: EventInterestStatus.PLANNING,
      },
      include: {
        event: {
          include: {
            _count: {
              select: {
                eventInterests: {
                  where: {
                    status: EventInterestStatus.PLANNING,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        event: {
          startTime: 'asc',
        },
      },
    });

    // Filter out past events
    const now = new Date();
    return interests
      .filter((i) => i.event.startTime > now)
      .map((i) => ({
        interestId: i.id,
        event: i.event,
        plannedCount: i.event._count.eventInterests,
        markedAt: i.createdAt,
      }));
  }

  /**
   * Get members planning to attend an event
   */
  async getEventPlanners(eventId: string, currentUserId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const interests = await this.prisma.eventInterest.findMany({
      where: {
        eventId,
        status: EventInterestStatus.PLANNING,
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            major: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // First marked first
      },
    });

    return {
      eventId,
      eventName: event.name,
      totalPlanning: interests.length,
      planners: interests.map((i) => ({
        member: i.member,
        markedAt: i.createdAt,
      })),
    };
  }

  /**
   * Get event planners with friend highlighting (Phase 2)
   * Requires FriendsService integration
   */
  async getEventPlannersWithFriends(
    eventId: string,
    currentUserId: string,
    friendsService?: any, // Injected FriendsService
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const interests = await this.prisma.eventInterest.findMany({
      where: {
        eventId,
        status: EventInterestStatus.PLANNING,
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
    });

    // If friendsService provided, check which planners are friends
    let friendIds: Set<string> = new Set();
    if (friendsService) {
      const friends = await friendsService.getFriends(currentUserId);
      friendIds = new Set(friends.map((f: any) => f.friend.id));
    }

    const friends: Array<{
      member: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        photoUrl: string | null;
      };
      markedAt: Date;
    }> = [];
    const others: Array<{
      member: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        photoUrl: string | null;
      };
      markedAt: Date;
    }> = [];

    for (const interest of interests) {
      const planner = {
        member: interest.member,
        markedAt: interest.createdAt,
      };

      if (friendIds.has(interest.member.id)) {
        friends.push(planner);
      } else {
        others.push(planner);
      }
    }

    return {
      eventId,
      eventName: event.name,
      totalPlanning: interests.length,
      friendsPlanning: friends,
      othersPlanning: others,
    };
  }

  /**
   * Check if user plans to attend event
   */
  async checkIfPlanning(memberId: string, eventId: string): Promise<boolean> {
    const interest = await this.prisma.eventInterest.findUnique({
      where: {
        memberId_eventId: {
          memberId,
          eventId,
        },
      },
    });

    return interest?.status === EventInterestStatus.PLANNING;
  }

  /**
   * Get count of people planning to attend event
   */
  async getEventPlanningCount(eventId: string): Promise<number> {
    return this.prisma.eventInterest.count({
      where: {
        eventId,
        status: EventInterestStatus.PLANNING,
      },
    });
  }

  /**
   * Admin: Get planning stats for all events
   */
  async getAllEventPlanningStats(semester?: string) {
    const events = await this.prisma.event.findMany({
      where: {
        isActive: true,
        ...(semester && { semester }),
      },
      include: {
        _count: {
          select: {
            eventInterests: {
              where: {
                status: EventInterestStatus.PLANNING,
              },
            },
            attendance: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return events.map((event) => ({
      eventId: event.id,
      eventName: event.name,
      startTime: event.startTime,
      category: event.category,
      expectedAttendance: event._count.eventInterests,
      actualAttendance: event._count.attendance,
      attendanceRate:
        event._count.eventInterests > 0
          ? (event._count.attendance / event._count.eventInterests) * 100
          : 0,
    }));
  }

  /**
   * Cleanup: Remove old plans for past events (run via cron)
   */
  async cleanupPastEventPlans() {
    const deleted = await this.prisma.eventInterest.deleteMany({
      where: {
        event: {
          endTime: {
            lt: new Date(),
          },
        },
        status: EventInterestStatus.PLANNING,
      },
    });

    return {
      message: 'Cleaned up old event plans',
      deletedCount: deleted.count,
    };
  }
}
